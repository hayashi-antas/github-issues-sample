"use strict";

const fs = require("fs");
const path = require("path");

/** .gitignore で無視するかどうかを判定するためのパターン群をロードする */
function loadIgnorePatterns(rootDir) {
  const patterns = [];
  const gitignorePath = path.join(rootDir, ".gitignore");

  // 組み込み: 常に無視するディレクトリ・ファイル（AIレビューに不要）
  patterns.push({ raw: "node_modules/", type: "dir" });
  patterns.push({ raw: "vendor/", type: "dir" });
  patterns.push({ raw: "*.lock", type: "glob" });

  if (!fs.existsSync(gitignorePath)) {
    return patterns;
  }

  const content = fs.readFileSync(gitignorePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const raw = line.replace(/#.*$/, "").trim();
    if (!raw) continue;

    const type = raw.endsWith("/") ? "dir" : raw.includes("*") ? "glob" : "path";
    patterns.push({ raw, type });
  }

  return patterns;
}

/**
 * パターンにマッチするか（簡易実装: 先頭・中間・末尾のセグメント一致と * のみ対応）
 */
function matchesPattern(filePath, { raw, type }) {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const segments = normalized.split("/");

  if (type === "dir") {
    const dir = raw.replace(/\/$/, "");
    if (dir.includes("*")) {
      const re = toSimpleGlobRe(dir);
      return segments.some((s) => re.test(s));
    }
    return segments.some((s) => s === dir || s.startsWith(dir + "."));
  }

  if (type === "glob") {
    const re = toSimpleGlobRe(raw);
    return re.test(normalized) || segments.some((s) => re.test(s));
  }

  // path: 完全一致またはプレフィックス一致
  return normalized === raw || normalized.startsWith(raw + "/");
}

function toSimpleGlobRe(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "\u0001")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0001/g, ".*");
  return new RegExp(escaped + "$");
}

/**
 * 指定パスが .gitignore および組み込みルールで無視されるか
 */
function isIgnored(filePath, patterns) {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  for (const p of patterns) {
    if (matchesPattern(normalized, p)) return true;
  }
  return false;
}

module.exports = {
  loadIgnorePatterns,
  isIgnored,
};
