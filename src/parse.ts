import { Either, error, ok } from "./either";
import type { RepositorySlug, SemanticVersion } from "./types";

export function parseToken(value: string): Either<string> {
  if (value.length === 0) {
    return error(["input.github expected to be non-empty"]);
  }
  return ok(value);
}

export type TargetBinary = {
  slug: RepositorySlug;
  tag: SemanticVersion;
};

export function parseRepository(value: string): Either<TargetBinary> {
  if (value.length === 0) {
    return error(["input.repo not defined"]);
  }
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

  const target: TargetBinary = {
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
