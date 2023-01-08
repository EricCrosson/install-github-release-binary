# install-github-release-binary

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

You can create compatible releases with [semantic-release], using a workflow like this [semantic-release Rust action].

[semantic-release]: https://github.com/semantic-release/semantic-release
[semantic-release rust action]: https://github.com/ericcrosson/rust-action
[target triple]: https://doc.rust-lang.org/nightly/rustc/platform-support.html

## Use

Use this action in a step:

```yaml
- name: Install flux-capacitor
  uses: EricCrosson/install-github-release-binary@v1
  with:
    repo: EricCrosson/flux-capacitor@v1
```

## Inputs

| Input Parameter | Required | Description                                                                          |
| :-------------: | :------: | ------------------------------------------------------------------------------------ |
|      repo       |   true   | Target repository slug and tag. [Details](#repo)                                     |
|      token      |  false   | GitHub token for REST requests. Defaults to `${{ github.token }}`. [Details](#token) |

#### repo

Target repository slug and tag.

Repository slugs are of the format `{owner}/{repository}`.
For example: `EricCrosson/flux-capacitor`.

Tags are of the format `v{semantic-version}`, where `{semantic-version}` is a [semantic version number].
Examples:

- `v1`
- `v1.2`
- `v1.2.3`

All together, the expected format is `{owner}/{repository}@v{semantic-version}`.
For example: `EricCrosson/flux-capacitor@v1`.

[semantic version number]: https://semver.org/

#### token

A GitHub token with at least `repo` scope.
Defaults to the `${{ github.token }}` created automatically by GitHub Actions.

To install a binary from a private GitHub repository, use a [Personal Access Token].

[personal access token]: https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
