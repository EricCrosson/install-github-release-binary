import test from "node:test";
import assert from "node:assert/strict";

import { getTargetTriple } from "../src/platform";

function check(arch: string, platform: string, expectedOutput: string) {
  // wrap in a thunk so we can pass it directly to `test`
  return function () {
    assert.equal(
      getTargetTriple(arch, platform as NodeJS.Platform),
      expectedOutput
    );
  };
}

test(
  "should support aarch64-apple-darwin",
  check("arm64", "darwin", "aarch64-apple-darwin")
);
test(
  "should support x86_64-apple-darwin",
  check("x64", "darwin", "x86_64-apple-darwin")
);
test(
  "should support aarch64-unknown-linux-musl",
  check("arm64", "linux", "aarch64-unknown-linux-musl")
);
test(
  "should support x86_64-unknown-linux-musl",
  check("x64", "linux", "x86_64-unknown-linux-musl")
);
