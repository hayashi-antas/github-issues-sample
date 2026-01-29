"use strict";

const { loadIgnorePatterns, isIgnored } = require("./gitignore_utils.js");
const { isLockfile, summarizeLockfileDiff } = require("./lockfile_summarizer.js");

/**
 * 生 diff をファイル単位に分割する。
 * 各要素: { path, rawBlock }
 */
function splitDiffByFile(rawDiff) {
  const blocks = rawDiff.split(/\n(?=diff --git )/);
  const result = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed.startsWith("diff --git ")) continue;

    const m = trimmed.match(/^diff --git a\/(.+?) b\/(.+?)(?:\n|$)/);
    const filePath = m ? (m[2] === "/dev/null" ? m[1] : m[2]) : null;
    if (!filePath) continue;

    result.push({ path: filePath, rawBlock: block });
  }

  return result;
}

/**
 * diff をクレンジングする。
 * - .gitignore にマッチするファイルは除外
 * - *.lock は全文を渡さず要約のみ
 * - それ以外はそのまま AI 入力に含める
 *
 * @param {string} rawDiff - GitHub API から取得した生 diff
 * @param {{ repoRoot?: string }} opts - repoRoot: リポジトリルート（.gitignore 読み込み用）
 * @returns {{ cleansedDiff: string, summary: { excluded: Array<{path:string,reason:string}>, lockfileSummaries: Array<{path:string,summary:string}> }}
 */
function cleanseDiff(rawDiff, opts = {}) {
  const repoRoot = opts.repoRoot || process.cwd();
  const patterns = loadIgnorePatterns(repoRoot);

  const excluded = [];
  const lockfileSummaries = [];
  const includedBlocks = [];

  const parts = splitDiffByFile(rawDiff);

  for (const { path: filePath, rawBlock } of parts) {
    const normalizedPath = filePath.replace(/\\/g, "/");

    if (isIgnored(normalizedPath, patterns)) {
      excluded.push({ path: normalizedPath, reason: ".gitignore or built-in rule" });
      continue;
    }

    if (isLockfile(normalizedPath)) {
      const summary = summarizeLockfileDiff(rawBlock);
      lockfileSummaries.push({ path: normalizedPath, summary });
      includedBlocks.push({
        type: "lockfile_summary",
        path: normalizedPath,
        summary,
      });
      continue;
    }

    includedBlocks.push({ type: "full", path: normalizedPath, rawBlock });
  }

  const header = buildCleansedHeader(excluded, lockfileSummaries);
  const bodyParts = includedBlocks.map((b) => {
    if (b.type === "lockfile_summary") {
      return `### [lockfile要約] ${b.path}\n${b.summary}\n`;
    }
    return b.rawBlock;
  });

  const cleansedDiff = [header, "", bodyParts.join("\n")].join("\n");

  return {
    cleansedDiff,
    summary: {
      excluded,
      lockfileSummaries,
    },
  };
}

function buildCleansedHeader(excluded, lockfileSummaries) {
  const lines = [
    "---",
    "【AIレビュー用にクレンジング済み】",
    "以下は .gitignore 除外・lockfile 要約適用後の diff です。",
    "",
  ];

  if (excluded.length) {
    lines.push("### 除外したファイル（全文は渡していません）");
    for (const { path: p, reason } of excluded) {
      lines.push(`- \`${p}\` (${reason})`);
    }
    lines.push("");
  }

  if (lockfileSummaries.length) {
    lines.push("### lockfile の扱い");
    lines.push("lockfile の diff 全文は渡していません。以下の要約のみ AI 入力に含めています。");
    for (const { path: p, summary } of lockfileSummaries) {
      lines.push(`- \`${p}\`: ${summary}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  return lines.join("\n");
}

/**
 * クレンジング結果を PR コメント用の「AI Input Cleansing Summary」Markdown に整形する
 */
function formatCleansingSummaryForComment(summary) {
  const { excluded, lockfileSummaries } = summary;
  const parts = ["### AI Input Cleansing Summary", ""];

  if (excluded.length === 0 && lockfileSummaries.length === 0) {
    parts.push("除外・要約はありません（diff をそのまま AI に渡しています）。");
    return parts.join("\n");
  }

  if (excluded.length) {
    parts.push(`**除外したファイル: ${excluded.length} 件**`);
    parts.push("");
    for (const { path: p, reason } of excluded.slice(0, 30)) {
      parts.push(`- \`${p}\` — ${reason}`);
    }
    if (excluded.length > 30) {
      parts.push(`- … 他 ${excluded.length - 30} 件`);
    }
    parts.push("");
  }

  if (lockfileSummaries.length) {
    parts.push(`**lockfile を要約して渡したファイル: ${lockfileSummaries.length} 件**`);
    parts.push("（全文は渡さず、依存の追加・削除・更新の簡易要約のみ AI 入力に含めています）");
    for (const { path: p, summary: s } of lockfileSummaries) {
      parts.push(`- \`${p}\`: ${s}`);
    }
  }

  return parts.join("\n");
}

module.exports = {
  cleanseDiff,
  formatCleansingSummaryForComment,
  splitDiffByFile,
};
