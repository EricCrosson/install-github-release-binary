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
  parseTargetReleases,
  parseToken,
} from "./parse";
import { getTargetTriple } from "./platform";
import {
  fetchReleaseAssetMetadataFromTag,
  findExactSemanticVersionTag,
} from "./fetch";
import type {
  ExactSemanticVersion,
  RepositorySlug,
  TargetRelease,
} from "./types";

function getDestinationDirectory(
  storageDirectory: string,
  slug: RepositorySlug,
  tag: ExactSemanticVersion,
  platform: NodeJS.Platform,
  architecture: string
): string {
  return path.join(
    storageDirectory,
    slug.owner.toLowerCase(),
    slug.repository.toLowerCase(),
    tag,
    `${platform}-${architecture}`
  );
}

async function installGitHubReleaseBinary(
  octokit: Octokit,
  targetRelease: TargetRelease,
  storageDirectory: string,
  enableCache: boolean,
  token: string
): Promise<void> {
  const targetTriple = getTargetTriple(arch(), platform());

  const releaseTag = await findExactSemanticVersionTag(
    octokit,
    targetRelease.slug,
    targetRelease.tag
  );

  const destinationDirectory = getDestinationDirectory(
    storageDirectory,
    targetRelease.slug,
    releaseTag,
    platform(),
    arch()
  );
  const destinationBasename = targetRelease.slug.repository;
  const destinationFilename = path.join(
    destinationDirectory,
    destinationBasename
  );

  // Try to restore from the cache.
  // Resolve exact semantic version tags before caching,
  // so upstream updates are always pulled in.
  const cachePaths = [destinationFilename];
  const cacheKey = [
    targetRelease.slug.owner.toLowerCase(),
    targetRelease.slug.repository.toLowerCase(),
    releaseTag,
    targetTriple,
  ].join("-");

  const restoreCache = enableCache
    ? await cache.restoreCache(cachePaths, cacheKey)
    : undefined;

  // If unable to restore from the cache, download the binary from GitHub
  if (restoreCache === undefined) {
    const releaseAsset = await fetchReleaseAssetMetadataFromTag(
      octokit,
      targetRelease.slug,
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

    if (enableCache) {
      await cache.saveCache(cachePaths, cacheKey);
    }
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
  const maybeTargetReleases = parseTargetReleases(core.getInput("targets"));
  const maybeHomeDirectory = parseEnvironmentVariable("HOME");

  const errors = [maybeToken, maybeTargetReleases, maybeHomeDirectory].flatMap(
    getErrors
  );
  if (errors.length > 0) {
    errors.forEach((error) => core.error(error));
    throw new Error("Invalid inputs");
  }

  const token = unwrap(maybeToken);
  const targetReleases = unwrap(maybeTargetReleases);
  const homeDirectory = unwrap(maybeHomeDirectory);
  const enableCache = core.getInput("cache") === "true";

  const storageDirectory = path.join(
    homeDirectory,
    ".install-github-release-binary",
    "bin"
  );
  const octokit = getOctokit(token);

  await Promise.all(
    targetReleases.map((targetRelease) =>
      installGitHubReleaseBinary(
        octokit,
        targetRelease,
        storageDirectory,
        enableCache,
        token
      )
    )
  );
}

main();
