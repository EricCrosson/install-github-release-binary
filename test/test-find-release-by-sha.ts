import test from "node:test";
import assert from "node:assert/strict";

import type { ExactSemanticVersion, Sha1Hash } from "../src/types";
import { sha1HashReducer, Tag } from "../src/fetch";
import { isNone, isSome, none, Option, some } from "../src/option";

import noReleaseCandidates from "./no-release-candidate-workflow.json";
import withReleaseCandidates from "./beta-workflow.json";

function check(
  givenSha: Sha1Hash,
  testData: readonly Tag[],
  expectedOutput: Option<ExactSemanticVersion>
) {
  const reducer = sha1HashReducer(givenSha);
  // Take the first 'some'
  const actualOutput = testData.reduce<Option<ExactSemanticVersion>>(
    (previousResult, tag) =>
      isNone(previousResult) ? reducer(tag) : previousResult,
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
  "should resolve a sha1 hash pointing to a major semantic version tag when the upstream project does not use release candidates",
  check(
    "aaebf5c572b64d17710f936905c1b35e1f58acc8" as Sha1Hash,
    noReleaseCandidates as unknown as Tag[],
    some("v1.0.8" as ExactSemanticVersion)
  )
);

test(
  "should resolve a sha1 hash pointing to an exact semantic version tag when the upstream project does not use release candidates",
  check(
    "7382f9a3ce14be1fd8b3656d262fc2c720c8f51c" as Sha1Hash,
    noReleaseCandidates as unknown as Tag[],
    some("v1.0.7" as ExactSemanticVersion)
  )
);

test(
  "should resolve a sha1 hash when the upstream project use release candidates",
  check(
    "2ba4cb142d0d5f6db85707fe55623b46c48cd6ac" as Sha1Hash,
    withReleaseCandidates as unknown as Tag[],
    some("v1.1.0-beta.1" as ExactSemanticVersion)
  )
);
