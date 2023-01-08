import type { Octokit } from "./octokit";
import { isEqual, none, Option, some } from "./option";

import {
  isExactSemanticVersion,
  ExactSemanticVersion,
  RepositorySlug,
  SemanticVersion,
  Sha,
  TargetTriple,
} from "./types";

type Commit = {
  sha: Sha;
};

type Tag = {
  name: SemanticVersion;
  commit: Commit;
};

export type TagsResponse = ReadonlyArray<Tag>;

function containsExactTag(
  tags: readonly SemanticVersion[] | undefined
): ExactSemanticVersion | undefined {
  if (tags === undefined) {
    return undefined;
  }
  return tags.find(isExactSemanticVersion);
}

// Find the exact semantic version tag that this tag maps to.
//
// We need an exact tag because that's the only accepted input
// to GitHub's getReleaseByTag endpoint.
export async function findExactSemanticVersionTag(
  octokit: Octokit,
  slug: RepositorySlug,
  givenTag: SemanticVersion
): Promise<ExactSemanticVersion> {
  if (isExactSemanticVersion(givenTag)) {
    return givenTag;
  }

  const versionsBySha: Record<Sha, SemanticVersion[]> = {};
  let givenTagSha: Option<Sha> = none();

  // Conditions to stop looping are -- we know both the:
  //
  // - sha that the given tag points to
  // - exact version tag matching that sha
  //
  // These can be found in either order.

  for await (const response of octokit.paginate.iterator(
    octokit.rest.repos.listTags,
    {
      owner: slug.owner,
      repo: slug.repository,
      per_page: 100,
    }
  )) {
    // NOTE: we are not parsing here, so this is an unlawful type cast
    for (const tag of response.data as unknown as TagsResponse) {
      const sha = tag.commit.sha;
      const version = tag.name;

      // If we found the sha the given tag points to
      if (version === givenTag) {
        givenTagSha = some(sha);
        // check if we already knew the exact version tag matching that sha
        const maybeExactTag = containsExactTag(versionsBySha[sha]);
        if (maybeExactTag !== undefined) {
          return maybeExactTag;
        }
      }

      // If we're not looking at the given tag, and we're not looking
      // at an exact version, this data is of no use to us.
      if (!isExactSemanticVersion(version)) {
        continue;
      }

      // It is possible that we know the sha for the given tag,
      // we're just looking for exact version tag matching that sha.
      if (isEqual(givenTagSha, sha)) {
        return version;
      }

      // Otherwise, record this map of sha -> exact version tag
      // so we can find it when we know the sha of the given tag.
      const associatedVersions = versionsBySha[sha];
      if (associatedVersions === undefined) {
        versionsBySha[sha] = [version];
      } else {
        associatedVersions.push(version);
      }
    }
  }

  throw new Error(
    `Expected to find an exact semantic version tag matching ${givenTag}`
  );
}

type ReleaseAssetMetadata = {
  name: string;
  url: string;
};

export async function fetchReleaseAssetMetadataFromTag(
  octokit: Octokit,
  slug: RepositorySlug,
  tag: ExactSemanticVersion,
  targetTriple: TargetTriple
): Promise<ReleaseAssetMetadata> {
  const releaseMetadata = await octokit.rest.repos.getReleaseByTag({
    owner: slug.owner,
    repo: slug.repository,
    tag,
  });
  const asset = releaseMetadata.data.assets.find(
    (asset) => asset.label === targetTriple
  );
  if (asset === undefined) {
    throw new Error(
      `Expected to find asset in release ${tag} with label ${targetTriple}`
    );
  }
  return {
    name: asset.name,
    url: asset.url,
  };
}
