import type { Option } from "./option";

/**
 * The following formats are valid:
 * - v1
 * - v1.2
 * - v1.2.3
 */
export type SemanticVersion =
  | ExactSemanticVersion
  | (string & { readonly __tag: unique symbol });

/**
 * The following format is valid: v1.2.3
 */
export type ExactSemanticVersion = string & { readonly __tag: unique symbol };

export function isExactSemanticVersion(
  value: string,
): value is ExactSemanticVersion {
  const regex =
    /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return regex.test(value);
}

export type Sha1Hash = string & { readonly __tag: unique symbol };
export type Sha256Hash = string & { readonly __tag: unique symbol };

export type RepositorySlug = {
  owner: string;
  repository: string;
};

export type TargetTriple = string & { readonly __tag: unique symbol };
export type BinaryName = string & { readonly __tag: unique symbol };

export type TargetRelease = {
  slug: RepositorySlug;
  tag: SemanticVersion;
  binaryName: Option<BinaryName>;
  checksum: Option<Sha256Hash>;
};
