import { createHash } from "node:crypto";
import { arch, platform } from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";

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
import { isSome, unwrapOrDefault } from "./option";

function getDestinationDirectory(
  storageDirectory: string,
  slug: RepositorySlug,
  tag: ExactSemanticVersion,
  platform: NodeJS.Platform,
  architecture: string,
): string {
  return path.join(
    storageDirectory,
    slug.owner.toLowerCase(),
    slug.repository.toLowerCase(),
    tag,
    `${platform}-${architecture}`,
  );
}

async function installGitHubReleaseBinary(
  octokit: Octokit,
  targetRelease: TargetRelease,
  storageDirectory: string,
  token: string,
): Promise<void> {
  const targetTriple = getTargetTriple(arch(), platform());

  const releaseTag = await findExactSemanticVersionTag(
    octokit,
    targetRelease.slug,
    targetRelease.tag,
  );

  const destinationDirectory = getDestinationDirectory(
    storageDirectory,
    targetRelease.slug,
    releaseTag,
    platform(),
    arch(),
  );
  const destinationBasename = unwrapOrDefault(
    targetRelease.binaryName,
    targetRelease.slug.repository,
  );
  const destinationFilename = path.join(
    destinationDirectory,
    destinationBasename,
  );

  const releaseAsset = await fetchReleaseAssetMetadataFromTag(
    octokit,
    targetRelease.slug,
    targetRelease.binaryName,
    releaseTag,
    targetTriple,
  );

  fs.mkdirSync(destinationDirectory, { recursive: true });
  await tc.downloadTool(
    releaseAsset.url,
    destinationFilename,
    `token ${token}`,
    { accept: "application/octet-stream" },
  );

  // Ensure the binary matches the expected checksum
  if (isSome(targetRelease.checksum)) {
    const fileBuffer = fs.readFileSync(destinationFilename);
    const hash = createHash("sha256");
    hash.update(fileBuffer);
    const calculatedChecksum = hash.digest("hex");
    const expectedChecksum = targetRelease.checksum.value;
    if (calculatedChecksum !== expectedChecksum) {
      const target = `${targetRelease.slug}@${targetRelease.tag}:sha256-${expectedChecksum}`;
      core.error(
        `Expected checksum ${expectedChecksum}, but got ${calculatedChecksum}`,
      );
      throw new Error(`Unexpected checksum for ${target}`);
    } else {
      core.debug(
        `Calculated checksum ${calculatedChecksum} matches expected checksum ${expectedChecksum}`,
      );
    }
  }

  // Permissions are an attribute of the filesystem, not the file.
  // Set the executable permission on the binary no matter where it came from.
  fs.chmodSync(destinationFilename, "755");
  core.addPath(destinationDirectory);
}

async function main(): Promise<void> {
  const maybeToken = parseToken(
    process.env["GITHUB_TOKEN"] || core.getInput("token"),
  );
  const maybeTargetReleases = parseTargetReleases(core.getInput("targets"));
  const maybeHomeDirectory = parseEnvironmentVariable("HOME");

  const errors = [maybeToken, maybeTargetReleases, maybeHomeDirectory].flatMap(
    getErrors,
  );
  if (errors.length > 0) {
    errors.forEach((error) => core.error(error));
    throw new Error("Invalid inputs");
  }

  const token = unwrap(maybeToken);
  const targetReleases = unwrap(maybeTargetReleases);
  const homeDirectory = unwrap(maybeHomeDirectory);

  const storageDirectory = path.join(
    homeDirectory,
    ".install-github-release-binary",
    "bin",
  );
  const octokit = getOctokit(token);

  // REFACTOR(OPTIMIZE): if two targets can be pulled from the same
  // release, we can make that happen with fewer API calls
  await Promise.all(
    targetReleases.map((targetRelease) =>
      installGitHubReleaseBinary(
        octokit,
        targetRelease,
        storageDirectory,
        token,
      ),
    ),
  );
}

main();
