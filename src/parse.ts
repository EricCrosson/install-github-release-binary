import { Either, error, isOk, ok } from "./either";
import type { RepositorySlug, SemanticVersion } from "./types";

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

export type TargetRelease = {
  slug: RepositorySlug;
  tag: SemanticVersion;
};

function parseTargetRelease(value: string): Either<TargetRelease> {
  const errors: string[] = [];
  const repo_regex = /^(\S+)\/(\S+)$/;
  if (repo_regex.test(value) === null) {
    errors.push(
      "input.repo does not describe a GitHub repository -- expected {owner}/{repository}@{tag} format (example: EricCrosson/git-disjoint@v2)"
    );
  }
  const tag_regex = /^(\S+)@v(\S+)$/;
  if (tag_regex.test(value) === null) {
    errors.push(
      "input.repo does not describe a tag version -- expected {owner}/{repository}@{tag} format (example: EricCrosson/git-disjoint@v2)"
    );
  }
  if (errors.length > 0) {
    return error(errors);
  }

  const regex = /^(\S+)\/(\S+)@(v\S+)$/;
  const match = value.match(regex);
  if (match === null || match.length !== 4) {
    return error([
      "input.repo invalid -- expected {owner}/{repository}@{tag} format (example: EricCrosson/git-disjoint@v2)",
    ]);
  }

  const target: TargetRelease = {
    slug: {
      owner: match[1] as string,
      repository: match[2] as string,
    },
    // NOTE: we're not really parsing the content of this string,
    // so this is an unlawful type assertion
    tag: match[3] as SemanticVersion,
  };
  return ok(target);
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
