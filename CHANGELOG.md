## [2.1.2](https://github.com/EricCrosson/install-github-release-binary/compare/v2.1.1...v2.1.2) (2023-02-13)


### Bug Fixes

* remove support for specifying targets based on sha ([cf8bf37](https://github.com/EricCrosson/install-github-release-binary/commit/cf8bf371d914d0df89dfaaa0b881c8753027b6f6)), closes [#26](https://github.com/EricCrosson/install-github-release-binary/issues/26)

## [2.1.1](https://github.com/EricCrosson/install-github-release-binary/compare/v2.1.0...v2.1.1) (2023-02-11)


### Bug Fixes

* **deps:** update dependency @actions/cache to v3.1.3 ([f649d0b](https://github.com/EricCrosson/install-github-release-binary/commit/f649d0bce913e6757da4a030c30b551157113627))

# [2.1.0](https://github.com/EricCrosson/install-github-release-binary/compare/v2.0.4...v2.1.0) (2023-02-10)


### Features

* support pinning target by sha1 hash ([e9c3331](https://github.com/EricCrosson/install-github-release-binary/commit/e9c333130ebad0fe7b5ca58162c7444a51b91731)), closes [#26](https://github.com/EricCrosson/install-github-release-binary/issues/26)

## [2.0.4](https://github.com/EricCrosson/install-github-release-binary/compare/v2.0.3...v2.0.4) (2023-02-05)


### Bug Fixes

* add target name to error messages ([17f43a7](https://github.com/EricCrosson/install-github-release-binary/commit/17f43a70889983e1935ce0b01192e0f0463fd88d)), closes [#23](https://github.com/EricCrosson/install-github-release-binary/issues/23)
* use official regular expression to detect semantic versions ([a277d43](https://github.com/EricCrosson/install-github-release-binary/commit/a277d430dae9b0429beca6c229c7454671fe07b5)), closes [#22](https://github.com/EricCrosson/install-github-release-binary/issues/22)

## [2.0.3](https://github.com/EricCrosson/install-github-release-binary/compare/v2.0.2...v2.0.3) (2023-01-21)


### Bug Fixes

* **deps:** update dependency @octokit/plugin-throttling to v5 ([695d207](https://github.com/EricCrosson/install-github-release-binary/commit/695d2078c04760f75152d1d278e5a4c2f60cd9d1))

## [2.0.2](https://github.com/EricCrosson/install-github-release-binary/compare/v2.0.1...v2.0.2) (2023-01-14)


### Bug Fixes

* **ci:** invoke reusable workflow correctly ([f894b7e](https://github.com/EricCrosson/install-github-release-binary/commit/f894b7ee2292c4cd3afb629f0c7787783e006b9e))
* **ci:** update semantic-release-action/github-actions to v4 ([ccde7ad](https://github.com/EricCrosson/install-github-release-binary/commit/ccde7ad34577315ea0a9bec20deb3e317c52b694))

## [2.0.1](https://github.com/EricCrosson/install-github-release-binary/compare/v2.0.0...v2.0.1) (2023-01-14)


### Bug Fixes

* **deps:** migrate to semantic-release-action/github-actions ([3e0f3f4](https://github.com/EricCrosson/install-github-release-binary/commit/3e0f3f41376e626f5f114272f670d894a01d84e5))

# [2.0.0](https://github.com/EricCrosson/install-github-release-binary/compare/v1.2.5...v2.0.0) (2023-01-12)


* feat!: support installing multiple binaries ([d28998a](https://github.com/EricCrosson/install-github-release-binary/commit/d28998aa67f85084cbdef24a0d3889cb659d8dee))


### BREAKING CHANGES

* rename `repo` to `targets`

## [1.2.5](https://github.com/EricCrosson/install-github-release-binary/compare/v1.2.4...v1.2.5) (2023-01-08)


### Bug Fixes

* disable caching by default ([f76c204](https://github.com/EricCrosson/install-github-release-binary/commit/f76c204763ddad3b496fd087f563cceacd05caf5))

## [1.2.4](https://github.com/EricCrosson/install-github-release-binary/compare/v1.2.3...v1.2.4) (2023-01-08)


### Bug Fixes

* tolerate cache errors ([30a42c0](https://github.com/EricCrosson/install-github-release-binary/commit/30a42c0c64ca99f0583a49159a66c18fe15a3d0e))

## [1.2.3](https://github.com/EricCrosson/install-github-release-binary/compare/v1.2.2...v1.2.3) (2023-01-08)


### Bug Fixes

* use consistent capitalization in cache key ([62a2b22](https://github.com/EricCrosson/install-github-release-binary/commit/62a2b22066046be01c782e66ad4039d40a73bede))

## [1.2.2](https://github.com/EricCrosson/install-github-release-binary/compare/v1.2.1...v1.2.2) (2023-01-08)


### Bug Fixes

* **debug:** debug harder ([e0acc8c](https://github.com/EricCrosson/install-github-release-binary/commit/e0acc8c8e769454c3ce71e6c834cd65ae88305a0))

## [1.2.1](https://github.com/EricCrosson/install-github-release-binary/compare/v1.2.0...v1.2.1) (2023-01-08)


### Bug Fixes

* **debug:** print information to debug cache behavior ([0212203](https://github.com/EricCrosson/install-github-release-binary/commit/02122032576c1936369ecb639ee43f6a831530cc))

# [1.2.0](https://github.com/EricCrosson/install-github-release-binary/compare/v1.1.0...v1.2.0) (2023-01-08)


### Features

* cache downloaded binaries ([7bdcb92](https://github.com/EricCrosson/install-github-release-binary/commit/7bdcb92e80668c11a31ae59b439f8b6b886517a0)), closes [#4](https://github.com/EricCrosson/install-github-release-binary/issues/4)

# [1.1.0](https://github.com/EricCrosson/install-github-release-binary/compare/v1.0.4...v1.1.0) (2023-01-08)


### Features

* support pagination of tags ([f8c4ae7](https://github.com/EricCrosson/install-github-release-binary/commit/f8c4ae77def45c77051ce2d70609cec9c1591a73)), closes [#3](https://github.com/EricCrosson/install-github-release-binary/issues/3)

## [1.0.4](https://github.com/EricCrosson/install-github-release-binary/compare/v1.0.3...v1.0.4) (2023-01-08)


### Bug Fixes

* **docs:** add criteria for compatibility ([8e86a16](https://github.com/EricCrosson/install-github-release-binary/commit/8e86a1624bb125e9514791563d22089a08735e06))

## [1.0.3](https://github.com/EricCrosson/install-github-release-binary/compare/v1.0.2...v1.0.3) (2023-01-08)


### Bug Fixes

* create directories recursively ([0800c87](https://github.com/EricCrosson/install-github-release-binary/commit/0800c8753e1b99cb148441090cb4c65fc73dbb7d))

## [1.0.2](https://github.com/EricCrosson/install-github-release-binary/compare/v1.0.1...v1.0.2) (2023-01-08)


### Bug Fixes

* correct version-matching regex ([78ed284](https://github.com/EricCrosson/install-github-release-binary/commit/78ed2849f03c0cfb8b8fe47317374746279784e8))

## [1.0.1](https://github.com/EricCrosson/install-github-release-binary/compare/v1.0.0...v1.0.1) (2023-01-08)


### Bug Fixes

* **ci:** include re-bundled code in release artifacts ([501722d](https://github.com/EricCrosson/install-github-release-binary/commit/501722d739323bc99e156e3655368c673740634b))

# 1.0.0 (2023-01-08)


### Features

* implement plugin ([917d82a](https://github.com/EricCrosson/install-github-release-binary/commit/917d82a4d574b33fc5ed5d693b02bddc18d0a322))
