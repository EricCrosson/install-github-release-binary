import type { Octokit } from "./octokit";

import type {
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

// NOTE: there's a foot-gun here around lack of pagination
export async function fetchRepoTags(
  octokit: Octokit,
  slug: RepositorySlug
): Promise<TagsResponse> {
  const response = await octokit.rest.repos.listTags({
    owner: slug.owner,
    repo: slug.repository,
    per_page: 100,
  });
  // NOTE: we are not parsing here, so this is an unlawful type cast
  return response.data as unknown as TagsResponse;
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
