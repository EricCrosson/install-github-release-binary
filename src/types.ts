// The following formats are valid:
// - v1
// - v1.2
// - v1.2.3
export type SemanticVersion =
  | ExactSemanticVersion
  | (string & { readonly __tag: unique symbol });

// The following format is valid: v1.2.3
export type ExactSemanticVersion = string & { readonly __tag: unique symbol };

export function isExactSemanticVersion(
  value: string
): value is ExactSemanticVersion {
  const regex = /^v\d+\.\d+\.\d+$/;
  return regex.test(value);
}

export type Sha = string & { readonly __tag: unique symbol };

export type RepositorySlug = {
  owner: string;
  repository: string;
};

export type TargetTriple = string & { readonly __tag: unique symbol };
