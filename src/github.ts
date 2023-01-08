import * as core from "@actions/core";

import type { TagsResponse } from "./fetch";
import {
  ExactSemanticVersion,
  isExactSemanticVersion,
  SemanticVersion,
  Sha,
} from "./types";

export function resolveReleaseTag(
  response: TagsResponse,
  target: SemanticVersion
): ExactSemanticVersion {
  let maybeTargetSha: Sha | undefined = undefined;

  const versionsBySha = response.reduce<Record<Sha, SemanticVersion[]>>(
    (acc, tag) => {
      const version = tag.name;
      const sha = tag.commit.sha;

      // update targetSha if we found it
      if (version === target) {
        maybeTargetSha = sha;
      }

      const associatedVersions = acc[sha] || [];
      associatedVersions.push(version);
      acc[sha] = associatedVersions;
      return acc;
    },
    {}
  );

  if (maybeTargetSha === undefined) {
    core.warning(
      "Disclaimer: pagination not yet implemented! Please open a ticket, maybe you can use an exact version number as a workaround"
    );
    core.error(`Did not find matching tag ${target}`);
    throw new Error(
      `Expected to find release matching tag ${target}, but could not find this tag`
    );
  }

  // It's wild that TypeScript is thinking targetSha is never without this line
  let targetSha: Sha = maybeTargetSha;

  if (isExactSemanticVersion(target)) {
    return target;
  }

  const versionsPointingToSameSha = versionsBySha[targetSha];

  if (versionsPointingToSameSha === undefined) {
    core.error(
      `Did not find any tag versions matching ${target}'s sha of ${targetSha}`
    );
    throw new Error(
      `Expected to find full semantic version tag referencing sha ${targetSha}, but found none`
    );
  }

  const fullSemanticVersions = versionsPointingToSameSha.filter(
    isExactSemanticVersion
  );

  if (fullSemanticVersions.length === 0) {
    core.error(
      `Did not find any tag versions matching ${target}'s sha of ${targetSha}`
    );
    throw new Error(
      `Expected to find full semantic version tag referencing sha ${targetSha}, but found none`
    );
  }

  return fullSemanticVersions[0] as ExactSemanticVersion;
}
