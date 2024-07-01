"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_node_crypto = require("node:crypto");
var import_node_os = require("node:os");
var fs = __toESM(require("node:fs"));
var path = __toESM(require("node:path"));
var core2 = __toESM(require("@actions/core"));
var tc = __toESM(require("@actions/tool-cache"));

// src/either.ts
function error(errors) {
  return { tag: "error", errors };
}
function ok(value) {
  return { tag: "ok", value };
}
function isOk(value) {
  return value.tag === "ok";
}
function unwrap(either) {
  if (either.tag === "error") {
    throw new Error(
      `Expected either to be 'ok', but got error: ${either.errors}`
    );
  }
  return either.value;
}
function getErrors(either) {
  if (either.tag === "ok") {
    return [];
  }
  return either.errors;
}

// src/octokit.ts
var core = __toESM(require("@actions/core"));
var import_rest = require("@octokit/rest");
var import_plugin_throttling = require("@octokit/plugin-throttling");
var ThrottlingOctokit = import_rest.Octokit.plugin(import_plugin_throttling.throttling);
function getOctokit(token) {
  return new ThrottlingOctokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter, options) => {
        core.warning(
          `RateLimit detected for request ${options.method} ${options.url}.`
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter, options) => {
        core.warning(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}.`
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
      }
    }
  });
}

// src/option.ts
function none() {
  return { tag: "none" };
}
function some(value) {
  return { tag: "some", value };
}
function isSome(value) {
  return value.tag === "some";
}
function isEqual(value, to) {
  if (value.tag === "none") {
    return false;
  }
  return value.value === to;
}
function unwrapOrDefault(value, orElse) {
  if (value.tag === "some") {
    return value.value;
  }
  return orElse;
}

// src/parse.ts
var regexes = {
  owner: /[^\s\/]+/,
  repository: /[^\s\/]+/,
  binaryName: /[^\s@]+/,
  majorSemanticVersion: /v(?:0|[1-9]\d*)/,
  majorMinorSemanticVersion: /v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)/,
  exactSemanticVersion: /v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?:[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/,
  sha256Hash: /[a-fA-F0-9]{64}/
};
function parseEnvironmentVariable(envVarName) {
  const value = process.env[envVarName];
  if (value === void 0) {
    return error([
      `expected environment variable '${envVarName}' to be defined`
    ]);
  }
  if (value.length === 0) {
    return error([
      `expected environment variable '${envVarName}' to be non-empty`
    ]);
  }
  return ok(value);
}
function parseToken(value) {
  if (value.length === 0) {
    return error(["expected input.token to be non-empty"]);
  }
  return ok(value);
}
function parseTargetReleaseVersion(value) {
  const {
    owner,
    repository,
    binaryName,
    majorSemanticVersion,
    majorMinorSemanticVersion,
    exactSemanticVersion,
    sha256Hash
  } = regexes;
  const regex = new RegExp(
    `^(${owner.source})/(${repository.source})(/${binaryName.source})?@(${majorSemanticVersion.source}|${majorMinorSemanticVersion.source}|${exactSemanticVersion.source})(?::sha256-(${sha256Hash.source}))?$`
  );
  const match = value.match(regex);
  if (match === null) {
    return error(["not a valid target release"]);
  }
  const target = {
    slug: {
      owner: match[1],
      repository: match[2]
    },
    binaryName: match[3] !== void 0 ? some(match[3].substring(1)) : none(),
    tag: match[4],
    checksum: match[5] !== void 0 ? some(match[5]) : none()
  };
  return ok(target);
}
function parseTargetRelease(value) {
  const maybeTargetRelease = parseTargetReleaseVersion(value);
  if (isOk(maybeTargetRelease)) {
    return ok(maybeTargetRelease.value);
  }
  return error([
    `input.targets contains invalid target -- '${value}' does not match expected format '{owner}/{repository}@{tag}' (example: EricCrosson/git-disjoint@v2)`
  ]);
}
function parseTargetReleases(value) {
  if (value.length === 0) {
    return error(["input.targets not defined"]);
  }
  const tokens = value.trim().split(/\s+/);
  const results = [];
  const errors = [];
  for (const token of tokens) {
    const release = parseTargetRelease(token);
    if (isOk(release)) {
      results.push(release.value);
    } else {
      const errorMessage = `Encountered errors parsing target ${token}:` + release.errors.map((error3) => `
  - ${error3}`).join("\n");
      errors.push(errorMessage);
    }
  }
  if (errors.length > 0) {
    return error(errors);
  }
  return ok(results);
}

// src/platform.ts
var ALL_TARGET_TRIPLES = [
  "aarch64-apple-darwin",
  "aarch64-unknown-linux-musl",
  "x86_64-apple-darwin",
  "x86_64-unknown-linux-musl"
];
function architectureLabel(arch2) {
  switch (arch2) {
    case "arm64":
      return "aarch64";
    case "x64":
      return "x86_64";
    default:
      throw new Error(
        `Unsupported architecture ${arch2} -- only aarch64 and x86_64 currently supported`
      );
  }
}
function platformLabel(platform2) {
  switch (platform2) {
    case "darwin":
      return {
        vendor: "apple",
        operatingSystem: "darwin"
      };
    case "linux":
      return {
        vendor: "unknown",
        operatingSystem: "linux-musl"
      };
    default:
      throw new Error(
        `Unsupported platform ${platform2} -- only darwin and linux currently supported`
      );
  }
}
function getTargetTriple(arch2, platform2) {
  const architecture = architectureLabel(arch2);
  const { vendor, operatingSystem } = platformLabel(platform2);
  return `${architecture}-${vendor}-${operatingSystem}`;
}
function stripTargetTriple(value) {
  if (ALL_TARGET_TRIPLES.find((targetTriple) => targetTriple === value)) {
    return none();
  }
  const stripped = ALL_TARGET_TRIPLES.reduce(
    (value2, targetTriple) => value2.replace(new RegExp(`-${targetTriple}$`), ""),
    value
  );
  return some(stripped);
}

// src/types.ts
function isExactSemanticVersion(value) {
  const regex = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return regex.test(value);
}

// src/fetch.ts
function containsExactTag(tags) {
  if (tags === void 0) {
    return void 0;
  }
  return tags.find(isExactSemanticVersion);
}
function semanticVersionTagReducer(givenTag) {
  const versionsBySha = {};
  let givenTagSha = none();
  return function reducer(tag) {
    const sha = tag.commit.sha;
    const version = tag.name;
    if (version === givenTag) {
      givenTagSha = some(sha);
      const maybeExactTag = containsExactTag(versionsBySha[sha]);
      if (maybeExactTag !== void 0) {
        return some(maybeExactTag);
      }
    }
    if (!isExactSemanticVersion(version)) {
      return none();
    }
    if (isEqual(givenTagSha, sha)) {
      return some(version);
    }
    const associatedVersions = versionsBySha[sha];
    if (associatedVersions === void 0) {
      versionsBySha[sha] = [version];
    } else {
      associatedVersions.push(version);
    }
    return none();
  };
}
async function findExactSemanticVersionTag(octokit, slug, target) {
  if (isExactSemanticVersion(target)) {
    return target;
  }
  const reducer = semanticVersionTagReducer(target);
  for await (const response of octokit.paginate.iterator(
    octokit.rest.repos.listTags,
    {
      owner: slug.owner,
      repo: slug.repository,
      per_page: 100
    }
  )) {
    for (const tag of response.data) {
      const maybeExactTag = reducer(tag);
      if (isSome(maybeExactTag)) {
        return maybeExactTag.value;
      }
    }
  }
  throw new Error(
    `Expected to find an exact semantic version tag matching ${target} for ${slug.owner}/${slug.repository}`
  );
}
async function fetchReleaseAssetMetadataFromTag(octokit, slug, binaryName, tag, targetTriple) {
  const releaseMetadata = await octokit.rest.repos.getReleaseByTag({
    owner: slug.owner,
    repo: slug.repository,
    tag
  });
  if (isSome(binaryName)) {
    const targetLabel = `${binaryName.value}-${targetTriple}`;
    const asset2 = releaseMetadata.data.assets.find(
      (asset3) => asset3.label === targetLabel
    );
    if (asset2 === void 0) {
      throw new Error(
        `Expected to find asset in release ${slug.owner}/${slug.repository}@${tag} with label ${targetLabel}`
      );
    }
    return {
      binaryName,
      url: asset2.url
    };
  }
  const matchingTargetTriples = releaseMetadata.data.assets.filter(
    (asset2) => typeof asset2.label === "string" && asset2.label.endsWith(targetTriple)
  );
  if (matchingTargetTriples.length === 0) {
    throw new Error(
      `Expected to find asset in release ${slug.owner}/${slug.repository}@${tag} with label ending in ${targetTriple}`
    );
  }
  if (matchingTargetTriples.length > 1) {
    throw new Error(
      `Ambiguous targets: expected to find a single asset in release ${slug.owner}/${slug.repository}@${tag} matching target triple ${targetTriple}, but found ${matchingTargetTriples.length}.

To resolve, specify the desired binary with the target format ${slug.owner}/${slug.repository}/<binary-name>@${tag}`
    );
  }
  const asset = matchingTargetTriples.shift();
  const targetName = stripTargetTriple(asset.label);
  return {
    binaryName: targetName,
    url: asset.url
  };
}

// src/index.ts
function getDestinationDirectory(storageDirectory, slug, tag, platform2, architecture) {
  return path.join(
    storageDirectory,
    slug.owner.toLowerCase(),
    slug.repository.toLowerCase(),
    tag,
    `${platform2}-${architecture}`
  );
}
async function installGitHubReleaseBinary(octokit, targetRelease, storageDirectory, token) {
  const targetTriple = getTargetTriple((0, import_node_os.arch)(), (0, import_node_os.platform)());
  const releaseTag = await findExactSemanticVersionTag(
    octokit,
    targetRelease.slug,
    targetRelease.tag
  );
  const destinationDirectory = getDestinationDirectory(
    storageDirectory,
    targetRelease.slug,
    releaseTag,
    (0, import_node_os.platform)(),
    (0, import_node_os.arch)()
  );
  const releaseAsset = await fetchReleaseAssetMetadataFromTag(
    octokit,
    targetRelease.slug,
    targetRelease.binaryName,
    releaseTag,
    targetTriple
  );
  const destinationBasename = unwrapOrDefault(
    releaseAsset.binaryName,
    targetRelease.slug.repository
  );
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
  if (isSome(targetRelease.checksum)) {
    const fileBuffer = fs.readFileSync(destinationFilename);
    const hash = (0, import_node_crypto.createHash)("sha256");
    hash.update(fileBuffer);
    const calculatedChecksum = hash.digest("hex");
    const expectedChecksum = targetRelease.checksum.value;
    if (calculatedChecksum !== expectedChecksum) {
      const target = `${targetRelease.slug}@${targetRelease.tag}:sha256-${expectedChecksum}`;
      core2.error(
        `Expected checksum ${expectedChecksum}, but got ${calculatedChecksum}`
      );
      throw new Error(`Unexpected checksum for ${target}`);
    } else {
      core2.debug(
        `Calculated checksum ${calculatedChecksum} matches expected checksum ${expectedChecksum}`
      );
    }
  }
  fs.chmodSync(destinationFilename, "755");
  core2.addPath(destinationDirectory);
}
async function main() {
  const maybeToken = parseToken(
    process.env["GITHUB_TOKEN"] || core2.getInput("token")
  );
  const maybeTargetReleases = parseTargetReleases(core2.getInput("targets"));
  const maybeHomeDirectory = parseEnvironmentVariable("HOME");
  const errors = [maybeToken, maybeTargetReleases, maybeHomeDirectory].flatMap(
    getErrors
  );
  if (errors.length > 0) {
    errors.forEach((error3) => core2.error(error3));
    throw new Error("Invalid inputs");
  }
  const token = unwrap(maybeToken);
  const targetReleases = unwrap(maybeTargetReleases);
  const homeDirectory = unwrap(maybeHomeDirectory);
  const storageDirectory = path.join(
    homeDirectory,
    ".install-github-release-binary",
    "bin"
  );
  const octokit = getOctokit(token);
  await Promise.all(
    targetReleases.map(
      (targetRelease) => installGitHubReleaseBinary(
        octokit,
        targetRelease,
        storageDirectory,
        token
      )
    )
  );
}
main();
