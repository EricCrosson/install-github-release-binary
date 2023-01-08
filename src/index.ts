import { arch, platform } from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";

import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

import { getErrors, unwrap } from "./either";
import { getOctokit, Octokit } from "./octokit";
import {
  parseEnvironmentVariable,
  parseRepository,
  parseToken,
  TargetBinary,
} from "./parse";
import { getTargetTriple } from "./platform";
import {
  fetchReleaseAssetMetadataFromTag,
  findExactSemanticVersionTag,
} from "./fetch";
import type { ExactSemanticVersion, RepositorySlug } from "./types";

function getDestinationDirectory(
  storageDirectory: string,
  slug: RepositorySlug,
  tag: ExactSemanticVersion,
  platform: NodeJS.Platform,
  architecture: string
): string {
  return path.join(
    storageDirectory,
    slug.owner,
    slug.repository,
    tag,
    `${platform}-${architecture}`
  );
}

async function installGitHubReleaseBinary(
  octokit: Octokit,
  targetBinary: TargetBinary,
  storageDirectory: string,
  token: string
): Promise<void> {
  const targetTriple = getTargetTriple(arch(), platform());

  const releaseTag = await findExactSemanticVersionTag(
    octokit,
    targetBinary.slug,
    targetBinary.tag
  );

  const destinationDirectory = getDestinationDirectory(
    storageDirectory,
    targetBinary.slug,
    releaseTag,
    platform(),
    arch()
  );
  const destinationBasename = targetBinary.slug.repository;
  const destinationFilename = path.join(
    destinationDirectory,
    destinationBasename
  );

  // Try to restore from the cache.
  // Resolve exact semantic version tags before caching,
  // so upstream updates are always pulled in.
  const cachePaths = [destinationFilename];
  const cacheKey = [
    targetBinary.slug.owner,
    targetBinary.slug.repository,
    releaseTag,
    targetTriple,
  ].join("-");
  const restoreCache = await cache.restoreCache(cachePaths, cacheKey);

  // DEBUG:
  console.log({ restoreCache });

  // If unable to restore from the cache, download the binary from GitHub
  if (restoreCache === undefined) {
    const releaseAsset = await fetchReleaseAssetMetadataFromTag(
      octokit,
      targetBinary.slug,
      releaseTag,
      targetTriple
    );

    fs.mkdirSync(destinationDirectory, { recursive: true });
    await tc.downloadTool(
      releaseAsset.url,
      destinationFilename,
      `token ${token}`,
      { accept: "application/octet-stream" }
    );

    await cache.saveCache(cachePaths, cacheKey);
  }

  // Permissions are an attribute of the filesystem, not the file.
  // Set the executable permission on the binary no matter where it came from.
  fs.chmodSync(destinationFilename, "755");
  core.addPath(destinationDirectory);
}

async function main(): Promise<void> {
  const maybeToken = parseToken(
    process.env["GITHUB_TOKEN"] || core.getInput("token")
  );
  const maybeTargetBinary = parseRepository(core.getInput("repo"));
  const maybeHomeDirectory = parseEnvironmentVariable("HOME");

  const errors = [maybeToken, maybeTargetBinary, maybeHomeDirectory].flatMap(
    getErrors
  );
  if (errors.length > 0) {
    errors.forEach((error) => core.error(error));
    throw new Error("Invalid inputs");
  }

  const token = unwrap(maybeToken);
  const targetBinary = unwrap(maybeTargetBinary);
  const homeDirectory = unwrap(maybeHomeDirectory);

  const storageDirectory = path.join(
    homeDirectory,
    ".install-github-release-binary",
    "bin"
  );
  const octokit = getOctokit(token);

  await installGitHubReleaseBinary(
    octokit,
    targetBinary,
    storageDirectory,
    token
  );
}

main();
