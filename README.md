# install-github-release-binary

[![Build Status]](https://github.com/EricCrosson/install-github-release-binary/actions/workflows/release.yml)

[build status]: https://github.com/EricCrosson/install-github-release-binary/actions/workflows/release.yml/badge.svg?event=push

**install-github-release-binary** is an opinionated GitHub Action for adding a binary from a GitHub Release to your CI `$PATH`.

The primary goals are, in order of priority:

1. control over software supply chain security (SSCS)
2. execute quickly
3. avoid rate limits

## Supported releases

This action only supports installing from releases where the release:

- is tagged with the full `{major}.{minor}.{patch}` semantic version
- contains raw binary assets (archives not supported)
- assets are labeled as follows:
  - when there is a single binary associated with a release, the label is the binary's [target triple]
  - when there are multiple binaries associated with a release, the label is `<binary name>-<target triple>`

You can create compatible releases with [semantic-release], using a workflow like [semantic-release-action/rust].

[semantic-release]: https://github.com/semantic-release/semantic-release
[semantic-release-action/rust]: https://github.com/semantic-release-action/rust
[target triple]: https://doc.rust-lang.org/nightly/rustc/platform-support.html

## Use

Use this action in a step:

```yaml
- name: Install flux-capacitor
  uses: EricCrosson/install-github-release-binary@v2
  with:
    targets: EricCrosson/flux-capacitor@v1
```

> **Note**
> I recommend adding an explicit step name, otherwise the step will only reference
> `EricCrosson/install-github-release-binary@v2`, not your targets.

Install multiple binaries:

```yaml
- name: Install future tools
  uses: EricCrosson/install-github-release-binary@v2
  with:
    targets: |
      EricCrosson/flux-capacitor@v1
      EricCrosson/steam-locomotive@v7.5.3
      EricCrosson/hoverboard@11.7.3:sha256-8a4600be96d2ec013209042458ce97a9652fcc46c1c855d0217aa42e330fc06e
```

Install a binary from a release with multiple binaries available:

```yaml
- name: Install flux-capacitor
  uses: EricCrosson/install-github-release-binary@v2
  with:
    targets: |
      EricCrosson/future-tools/flux-capacitor@v1
```

## Inputs

| Input Parameter | Required | Description                                                                                                         |
| :-------------: | :------: | ------------------------------------------------------------------------------------------------------------------- |
|     targets     |   true   | Whitespace separated list of target GitHub Releases in format `{owner}/{repository}@{version}`. [Details](#targets) |
|      token      |  false   | GitHub token for REST requests. Defaults to `${{ github.token }}`. [Details](#token)                                |

#### targets

Specify a whitespace-separated list of targets.

Each target is specified by repo slug and a [semantic version number] using the format `{owner}/{repository}@v{semantic-version}`.
Optionally, include:

- the particular binary to install (required when a release contains multiple binaries)
- a sha256 checksum

Examples:

- `EricCrosson/flux-capacitor@v1`
- `EricCrosson/flux-capacitor@v1.2`
- `EricCrosson/flux-capacitor@v1.2.3`
- `EricCrosson/flux-capacitor@v1.2.3:sha256-ad91159c656d427ad8fe5ded2946f29f3a612c6b7a4af6129e9aa85256b7299e`
- `EricCrosson/future-tools/flux-capacitor@v1`

[semantic version number]: https://semver.org/

#### token

A GitHub token with `repo` scope.
Defaults to the `${{ github.token }}` created automatically by GitHub Actions.

To install a binary from a private GitHub repository, use a [Personal Access Token].

[personal access token]: https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

## Versioning

This action assumes it is running on a [GitHub-hosted runner], so bumping any dependency to a version [preinstalled] on GitHub-hosted runners is not considered a breaking change.

[github-hosted runner]: https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners
[preinstalled]: https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#preinstalled-software
