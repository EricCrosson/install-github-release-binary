import test from "node:test";
import assert from "node:assert/strict";

import { parseTargetReleases } from "../src/parse";
import { Either, error, isErr, isOk, ok } from "../src/either";
import type { SemanticVersion, Sha256Hash, TargetRelease } from "../src/types";
import { none, some } from "../src/option";

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
        checksum: none(),
      },
    ])
  )
);

test(
  "should parse a slug and version and regex",
  check(
    "foo/bar@v1:sha256-8a4600be96d2ec013209042458ce97a9652fcc46c1c855d0217aa42e330fc06e",
    ok([
      {
        slug: {
          owner: "foo",
          repository: "bar",
        },
        tag: "v1" as SemanticVersion,
        checksum: some(
          "8a4600be96d2ec013209042458ce97a9652fcc46c1c855d0217aa42e330fc06e" as Sha256Hash
        ),
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
        checksum: none(),
      },
      {
        slug: {
          owner: "qux",
          repository: "baz",
        },
        tag: "v2.3.4" as SemanticVersion,
        checksum: none(),
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
        checksum: none(),
      },
      {
        slug: {
          owner: "qux",
          repository: "baz",
        },
        tag: "v2.3.4" as SemanticVersion,
        checksum: none(),
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
        checksum: none(),
      },
      {
        slug: {
          owner: "qux",
          repository: "baz",
        },
        tag: "v2.3.4" as SemanticVersion,
        checksum: none(),
      },
    ])
  )
);
