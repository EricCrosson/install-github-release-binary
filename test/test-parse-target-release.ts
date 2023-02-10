import test from "node:test";
import assert from "node:assert/strict";

import { parseTargetReleases } from "../src/parse";
import { Either, error, isErr, isOk, ok } from "../src/either";
import type { SemanticVersion, TargetRelease } from "../src/types";

function err<A>(): Either<A> {
  return error([""]);
}

function check(
  input: string,
  expectedOutput: Either<readonly TargetRelease[]>
) {
  // wrap in a thunk so we can pass it directly to `test`
  const actualOutput = parseTargetReleases(input);
  return function () {
    if (isOk(expectedOutput)) {
      assert.deepEqual(actualOutput, expectedOutput);
    } else {
      // I don't care too much right now what the error is
      assert(isErr(actualOutput));
    }
  };
}

test("should not parse an empty string", check("", err()));

test("should not parse a slug without a version", check("foo/bar", err()));

test(
  "should not parse a slug without a version starting with v",
  check("foo/bar@1", err())
);

test(
  "should parse a slug and version starting with v",
  check(
    "foo/bar@v1",
    ok([
      {
        slug: {
          owner: "foo",
          repository: "bar",
        },
        tag: "v1" as SemanticVersion,
      },
    ])
  )
);

test(
  "should parse multiple targets separated with whitespace",
  check(
    "foo/bar@v1 qux/baz@v2.3.4",
    ok([
      {
        slug: {
          owner: "foo",
          repository: "bar",
        },
        tag: "v1" as SemanticVersion,
      },
      {
        slug: {
          owner: "qux",
          repository: "baz",
        },
        tag: "v2.3.4" as SemanticVersion,
      },
    ])
  )
);

test(
  "should parse multiple targets separated with whitespace with leading whitespace",
  check(
    `    
   foo/bar@v1 qux/baz@v2.3.4`,
    ok([
      {
        slug: {
          owner: "foo",
          repository: "bar",
        },
        tag: "v1" as SemanticVersion,
      },
      {
        slug: {
          owner: "qux",
          repository: "baz",
        },
        tag: "v2.3.4" as SemanticVersion,
      },
    ])
  )
);

test(
  "should parse multiple targets separated with whitespace with trailing whitespace",
  check(
    `foo/bar@v1    
  qux/baz@v2.3.4
  `,
    ok([
      {
        slug: {
          owner: "foo",
          repository: "bar",
        },
        tag: "v1" as SemanticVersion,
      },
      {
        slug: {
          owner: "qux",
          repository: "baz",
        },
        tag: "v2.3.4" as SemanticVersion,
      },
    ])
  )
);

test(
  "should parse a slug and exact sha",
  check(
    "foo/bar@2ba4cb142d0d5f6db85707fe55623b46c48cd6ac",
    ok([
      {
        slug: {
          owner: "foo",
          repository: "bar",
        },
        tag: "2ba4cb142d0d5f6db85707fe55623b46c48cd6ac" as SemanticVersion,
      },
    ])
  )
);
