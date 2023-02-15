import { Either, error, isOk, ok } from "./either";
import { none, some } from "./option";
import type { SemanticVersion, Sha256Hash, TargetRelease } from "./types";

const regexes = {
  owner: /\S+/,
  repository: /\S+/,
  majorSemanticVersion: /v(?:0|[1-9]\d*)/,
  majorMinorSemanticVersion: /v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)/,
  exactSemanticVersion:
    /v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?:[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/,
  sha256Hash: /[a-fA-F0-9]{64}/,
};

export function parseEnvironmentVariable(envVarName: string): Either<string> {
  const value = process.env[envVarName];
  if (value === undefined) {
    return error([
      `Expected environment variable '${envVarName}' to be defined`,
    ]);
  }
  if (value.length === 0) {
    return error([
      `Expected environment variable '${envVarName}' to be non-empty`,
    ]);
  }
  return ok(value);
}

export function parseToken(value: string): Either<string> {
  if (value.length === 0) {
    return error(["input.github expected to be non-empty"]);
  }
  return ok(value);
}

function parseTargetReleaseVersion(value: string): Either<TargetRelease> {
  const {
    owner,
    repository,
    majorSemanticVersion,
    majorMinorSemanticVersion,
    exactSemanticVersion,
    sha256Hash,
  } = regexes;
  const regex = new RegExp(
    `^(${owner.source})/(${repository.source})@(${majorSemanticVersion.source}|${majorMinorSemanticVersion.source}|${exactSemanticVersion.source})(?::sha256-(${sha256Hash.source}))?$`
  );
  const match = value.match(regex);
  if (match === null) {
    // This error message is never used
    return error(["not a valid target release"]);
  }
  console.log(match);
  const target: TargetRelease = {
    slug: {
      owner: match[1] as string,
      repository: match[2] as string,
    },
    tag: match[3] as SemanticVersion,
    checksum: match[4] !== undefined ? some(match[4] as Sha256Hash) : none(),
  };
  return ok(target);
}

function parseTargetRelease(value: string): Either<TargetRelease> {
  const maybeTargetRelease = parseTargetReleaseVersion(value);

  if (isOk(maybeTargetRelease)) {
    return ok(maybeTargetRelease.value);
  }

  return error([
    `input.targetes invalid -- '${value}' does not match expected format '{owner}/{repository}@{tag}' (example: EricCrosson/git-disjoint@v2)`,
  ]);
}

export function parseTargetReleases(value: string): Either<TargetRelease[]> {
  if (value.length === 0) {
    return error(["input.targets not defined"]);
  }
  const tokens = value.trim().split(/\s+/);

  const results: TargetRelease[] = [];
  const errors: string[] = [];

  for (const token of tokens) {
    const release = parseTargetRelease(token);
    if (isOk(release)) {
      results.push(release.value);
    } else {
      const errorMessage =
        `Encountered errors parsing target ${token}:` +
        release.errors.map((error) => `\n  - ${error}`).join("\n");
      errors.push(errorMessage);
    }
  }

  if (errors.length > 0) {
    return error(errors);
  }
  return ok(results);
}
