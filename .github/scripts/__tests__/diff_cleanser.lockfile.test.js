"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { cleanseDiff } = require("../diff_cleanser.js");

// Ensures lockfile diffs are summarized instead of forwarded as-is.
test("summarizes lockfile diff without excluding it", (t) => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diff-cleanser-"));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));

  const rawDiff = [
    "diff --git a/package-lock.json b/package-lock.json",
    "index 1111111..2222222 100644",
    "--- a/package-lock.json",
    "+++ b/package-lock.json",
    "@@ -1,3 +1,4 @@",
    "-  \"left\": 1",
    "+  \"left\": 2",
    "+  \"node_modules/foo\": \"1.0.0\"",
    "+  \"node_modules/@scope/bar\": \"2.0.0\"",
  ].join("\n");

  const { cleansedDiff, summary } = cleanseDiff(rawDiff, { repoRoot });

  assert.equal(summary.excluded.length, 0, "lockfile should not be excluded");
  assert.equal(summary.lockfileSummaries.length, 1, "lockfile summary should exist");
  assert.equal(summary.lockfileSummaries[0].path, "package-lock.json");
  assert.match(summary.lockfileSummaries[0].summary, /行追加/);
  assert.match(summary.lockfileSummaries[0].summary, /foo/);
  assert.match(summary.lockfileSummaries[0].summary, /@scope\/bar/);

  assert.match(cleansedDiff, /### \[lockfile要約\] package-lock\.json/);
  assert.ok(cleansedDiff.includes(summary.lockfileSummaries[0].summary));
  assert.ok(!cleansedDiff.includes("@@ -1,3 +1,4 @@"), "raw lockfile diff should be omitted");
  assert.ok(!cleansedDiff.includes("+++ b/package-lock.json"), "raw diff header should be omitted");
});
