import test from "node:test";
import assert from "node:assert/strict";

import type { ExactSemanticVersion, SemanticVersion } from "../src/types";
import { exactSemanticVersionTagReducer, Tag } from "../src/fetch";
import { isNone, isSome, none, Option, some } from "../src/option";

import noReleaseCandidates from "./no-release-candidate-workflow.json";
import withReleaseCandidates from "./beta-workflow.json";

function check(
  givenTag: SemanticVersion,
  testData: readonly Tag[],
  expectedOutput: Option<ExactSemanticVersion>
) {
  const reducer = exactSemanticVersionTagReducer(givenTag);
  const actualOutput = testData.reduce<Option<ExactSemanticVersion>>(
    (_previousResult, tag) => reducer(tag),
    none()
  );

  // wrap in a thunk so we can pass it directly to `test`
  return function () {
    if (isSome(expectedOutput)) {
      assert.deepEqual(actualOutput, expectedOutput);
    } else {
      // I don't care too much right now what the error is
      assert(isNone(actualOutput));
    }
  };
}

test(
  "should resolve an exact semantic tag when the upstream project does not use release candidates",
  check(
    "v1" as SemanticVersion,
    noReleaseCandidates as unknown as Tag[],
    some("v1.0.8" as ExactSemanticVersion)
  )
);

test(
  "should resolve an exact semantic tag when the upstream project use release candidates",
  check(
    "v1" as SemanticVersion,
    withReleaseCandidates as unknown as Tag[],
    some("v1.1.0-beta.1" as ExactSemanticVersion)
  )
);
