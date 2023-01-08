import { arch, platform } from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";

import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

import { getErrors, unwrap } from "./either";
import { resolveReleaseTag } from "./github";
import { getOctokit, Octokit } from "./octokit";
import {
  parseCacheDirectory,
  parseRepository,
  parseToken,
  TargetBinary,
} from "./parse";
import { getTargetTriple } from "./platform";
import { fetchReleaseAssetMetadataFromTag, fetchRepoTags } from "./fetch";
import type { ExactSemanticVersion, RepositorySlug } from "./types";

function getDestinationDirectory(
  cacheDirectory: string,
  slug: RepositorySlug,
  tag: ExactSemanticVersion,
  platform: NodeJS.Platform,
  architecture: string
): string {
  return path.join(
    cacheDirectory,
    slug.owner,
    slug.repository,
    tag,
    `${platform}-${architecture}`
  );
}

async function installGitHubReleaseBinary(
  octokit: Octokit,
  targetBinary: TargetBinary,
  cacheDirectory: string,
  token: string
): Promise<void> {
  // NOTE: there's a foot-gun here cause by lack of pagination
  const repoTags = await fetchRepoTags(octokit, targetBinary.slug);
  const releaseTag = resolveReleaseTag(repoTags, targetBinary.tag);
  const targetTriple = getTargetTriple(arch(), platform());

  const releaseAsset = await fetchReleaseAssetMetadataFromTag(
    octokit,
    targetBinary.slug,
    releaseTag,
    targetTriple
  );

  const destinationDirectory = getDestinationDirectory(
    cacheDirectory,
    targetBinary.slug,
    releaseTag,
    platform(),
    arch()
  );
  const destinationBasename = releaseAsset.name.replace(`-${targetTriple}`, "");
  const destinationFilename = path.join(
    destinationDirectory,
    destinationBasename
  );

  fs.mkdirSync(destinationDirectory, { recursive: true });
  await tc.downloadTool(
    releaseAsset.url,
    destinationFilename,
    `token ${token}`,
    { accept: "application/octet-stream" }
  );
  fs.chmodSync(destinationFilename, "755");

  core.addPath(destinationDirectory);
}

async function main(): Promise<void> {
  const maybeToken = parseToken(
    process.env["GITHUB_TOKEN"] || core.getInput("token")
  );
  const maybeTargetBinary = parseRepository(core.getInput("repo"));
  const maybeCacheDirectory = parseCacheDirectory(
    process.env["RUNNER_TOOL_CACHE"]
  );

  const errors = [maybeToken, maybeTargetBinary, maybeCacheDirectory].flatMap(
    (parsedValue) => getErrors(parsedValue)
  );
  if (errors.length > 0) {
    errors.forEach((error) => core.error(error));
    throw new Error("Invalid inputs");
  }

  const token = unwrap(maybeToken);
  const targetBinary = unwrap(maybeTargetBinary);
  const cacheDirectory = unwrap(maybeCacheDirectory);
  const octokit = getOctokit(token);

  await installGitHubReleaseBinary(
    octokit,
    targetBinary,
    cacheDirectory,
    token
  );
}

main();
