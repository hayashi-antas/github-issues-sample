"use strict";

const path = require("path");

const LOCKFILE_NAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Gemfile.lock",
  "Cargo.lock",
  "go.sum",
  "poetry.lock",
]);

function isLockfile(filePath) {
  const base = path.basename(filePath);
  if (LOCKFILE_NAMES.has(base)) return true;
  if (base.endsWith(".lock")) return true;
  return false;
}

/**
 * lockfile の diff から「追加・削除・更新」の簡易要約を生成する。
 * 全文は AI に渡さず、この要約のみを AI 入力に含める。
 */
function summarizeLockfileDiff(diffContent) {
  if (!diffContent || typeof diffContent !== "string") {
    return "(lockfile: no diff content)";
  }

  let added = 0;
  let removed = 0;
  const addedPackages = new Set();
  const removedPackages = new Set();

  const lines = diffContent.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      added++;
      extractPackageName(line, addedPackages);
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      removed++;
      extractPackageName(line, removedPackages);
    }
  }

  const parts = [`${added} 行追加, ${removed} 行削除`];

  if (addedPackages.size || removedPackages.size) {
    const onlyAdded = [...addedPackages].filter((p) => !removedPackages.has(p));
    const onlyRemoved = [...removedPackages].filter((p) => !addedPackages.has(p));
    const maybeUpdated = [...addedPackages].filter((p) => removedPackages.has(p));
    if (onlyAdded.length) parts.push(`追加らしい依存: ${onlyAdded.slice(0, 15).join(", ")}${onlyAdded.length > 15 ? " …" : ""}`);
    if (onlyRemoved.length) parts.push(`削除らしい依存: ${onlyRemoved.slice(0, 15).join(", ")}${onlyRemoved.length > 15 ? " …" : ""}`);
    if (maybeUpdated.length) parts.push(`更新の可能性: ${maybeUpdated.slice(0, 10).join(", ")}${maybeUpdated.length > 10 ? " …" : ""}`);
  }

  return parts.join("。");
}

function extractPackageName(line, outSet) {
  // 1. package-lock.json: "node_modules/foo" や "node_modules/@scope/bar"
  const nodeModulesMatch = line.match(/node_modules\/(@[^/]+\/[^"'\s/]+|[^"'\s/]+)/);
  if (nodeModulesMatch) {
    outSet.add(nodeModulesMatch[1]);
    return;
  }

  // 2. package-lock.json: JSON キー形式 "foo": { や "@scope/bar": {
  const jsonKeyMatch = line.match(/^\s*[+-]\s*"(@[^/]+\/[^"]+|[^"@]+)":\s*\{/);
  if (jsonKeyMatch) {
    outSet.add(jsonKeyMatch[1]);
    return;
  }

  // 3. yarn.lock: 引用符なし記法 foo@^1.0.0: や @scope/bar@^2.0.0:
  const yarnUnquotedMatch = line.match(/^\s*[+-]\s*(@[^/]+\/[^@\s]+|[^@\s]+)@[^:]+:/);
  if (yarnUnquotedMatch) {
    outSet.add(yarnUnquotedMatch[1]);
    return;
  }

  // 4. yarn.lock 等: 引用符付き "package@version"
  const quotedMatch = line.match(/"(@[^/]+\/[^"@]+|[^"@]+)@[^"]*"/);
  if (quotedMatch) {
    outSet.add(quotedMatch[1]);
    return;
  }
}

module.exports = {
  isLockfile,
  summarizeLockfileDiff,
};
