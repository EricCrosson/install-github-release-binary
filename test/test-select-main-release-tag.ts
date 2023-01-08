import test from "node:test";
import assert from "node:assert/strict";

import rawTags from "./fixtures/tags.json";

import { resolveReleaseTag } from "../src/github";
import type { TagsResponse } from "../src/fetch";
import type { SemanticVersion } from "../src/types";

const tags = rawTags as unknown as TagsResponse;

function check(input: string, expectedOutput: string) {
  // wrap in a thunk so we can pass it directly to `test`
  return function () {
    assert.equal(
      resolveReleaseTag(tags, input as SemanticVersion),
      expectedOutput
    );
  };
}

test("should resolve tag from major format", check("v1", "v1.0.4"));
test("should resolve tag from major-minor format", check("v1.0", "v1.0.4"));
test(
  "should select self when major-minor-patch format",
  check("v1.0.4", "v1.0.4")
);
