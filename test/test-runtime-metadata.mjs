import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const actionMetadata = readFileSync(
  new URL("../action.yml", import.meta.url),
  "utf8",
);
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

test("action metadata uses the current GitHub Actions Node runtime", () => {
  assert.match(actionMetadata, /using:\s*node24/);
});

test("build script targets the current GitHub Actions Node runtime", () => {
  assert.match(packageJson.scripts?.build ?? "", /--target=node24\b/);
});
