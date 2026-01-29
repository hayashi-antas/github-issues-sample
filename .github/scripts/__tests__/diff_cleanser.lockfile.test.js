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
// Ensures yarn.lock unquoted syntax and JSON key format are properly extracted
test("extracts package names from yarn.lock and JSON key formats", (t) => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diff-cleanser-"));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));

  const rawDiff = [
    "diff --git a/yarn.lock b/yarn.lock",
    "index 3333333..4444444 100644",
    "--- a/yarn.lock",
    "+++ b/yarn.lock",
    "@@ -10,5 +10,8 @@",
    "+lodash@^4.17.21:",
    "+  version \"4.17.21\"",
    "+",
    "+@babel/core@^7.20.0:",
    "+  version \"7.20.5\"",
    "-react@^18.0.0:",
    "-  version \"18.0.0\"",
  ].join("\n");

  const { summary } = cleanseDiff(rawDiff, { repoRoot });

  assert.equal(summary.lockfileSummaries.length, 1);
  assert.equal(summary.lockfileSummaries[0].path, "yarn.lock");
  assert.match(summary.lockfileSummaries[0].summary, /lodash/);
  assert.match(summary.lockfileSummaries[0].summary, /@babel\/core/);
  assert.match(summary.lockfileSummaries[0].summary, /react/);
});
// Ensures .gitignore exclusion and lockfile summarization work simultaneously
test("handles .gitignore exclusion and lockfile summarization together", (t) => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diff-cleanser-"));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));

  fs.writeFileSync(path.join(repoRoot, ".gitignore"), "dist/\nnode_modules/\n");

  const rawDiff = [
    "diff --git a/package-lock.json b/package-lock.json",
    "index aaa..bbb 100644",
    "+  \"node_modules/express\": \"1.0.0\"",
    "",
    "diff --git a/dist/bundle.js b/dist/bundle.js",
    "index ccc..ddd 100644",
    "+console.log('built');",
    "",
    "diff --git a/src/index.js b/src/index.js",
    "index eee..fff 100644",
    "+const app = require('express');",
  ].join("\n");

  const { cleansedDiff, summary } = cleanseDiff(rawDiff, { repoRoot });

  assert.equal(summary.lockfileSummaries.length, 1);
  assert.equal(summary.lockfileSummaries[0].path, "package-lock.json");
  assert.match(summary.lockfileSummaries[0].summary, /express/);

  assert.equal(summary.excluded.length, 1);
  assert.equal(summary.excluded[0].path, "dist/bundle.js");

  assert.match(cleansedDiff, /src\/index\.js/);
  assert.match(cleansedDiff, /require\('express'\)/);
});
