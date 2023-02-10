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
- assets are labeled ending with the binary's [target triple]
- the binary name is the repository name

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

Install multiple binaries:

```yaml
- name: Install flux-capacitor
  uses: EricCrosson/install-github-release-binary@v2
  with:
    targets: |
      EricCrosson/flux-capacitor@v1
      EricCrosson/steam-locomotive@v7.5.3
      EricCrosson/hoverboard@7382f9a3ce14be1fd8b3656d262fc2c720c8f51c
```

## Inputs

| Input Parameter | Required | Description                                                                                                         |
| :-------------: | :------: | ------------------------------------------------------------------------------------------------------------------- |
|     targets     |   true   | Whitespace separated list of target GitHub Releases in format `{owner}/{repository}@{version}`. [Details](#targets) |
|      token      |  false   | GitHub token for REST requests. Defaults to `${{ github.token }}`. [Details](#token)                                |

#### targets

Specify a whitespace-separated list of targets.

Each target is specified by repo slug and a [semantic version number] or sha1 hash.

Accepted formats:

- `{owner}/{repository}@v{semantic-version}`
- `{owner}/{repository}@{sha1-hash}`

Examples:

- `EricCrosson/flux-capacitor@v1`
- `EricCrosson/flux-capacitor@v1.2`
- `EricCrosson/flux-capacitor@v1.2.3`
- `EricCrosson/flux-capacitor@aaebf5c572b64d17710f936905c1b35e1f58acc8`

[semantic version number]: https://semver.org/

#### token

A GitHub token with `repo` scope.
Defaults to the `${{ github.token }}` created automatically by GitHub Actions.

To install a binary from a private GitHub repository, use a [Personal Access Token].

[personal access token]: https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
