const repoFull = process.env.REPO; // owner/repo
const issueNumber = Number(process.env.ISSUE_NUMBER);
const ghToken = process.env.GITHUB_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4.1";

if (!repoFull || !issueNumber || !ghToken || !openaiKey) {
  console.error("Missing env vars. Required: REPO, ISSUE_NUMBER, GITHUB_TOKEN, OPENAI_API_KEY");
  process.exit(1);
}

const [owner, repo] = repoFull.split("/");

async function gh(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: "application/vnd.github+json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return res;
}

async function getPR() {
  const res = await gh(`/repos/${owner}/${repo}/pulls/${issueNumber}`);
  return res.json();
}

async function getDiff() {
  const res = await gh(`/repos/${owner}/${repo}/pulls/${issueNumber}`, {
    headers: { Accept: "application/vnd.github.v3.diff" },
  });
  return res.text();
}

function trimDiff(text, maxChars = 120000) {
  return text.length > maxChars ? text.slice(0, maxChars) + "\n\n[TRUNCATED]\n" : text;
}

// Responses API の生JSONからテキストを抽出（output配列をなめる）
function extractOutputText(data) {
  // SDK/一部レスポンスで output_text がある場合は最優先
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const out = data?.output;
  if (!Array.isArray(out)) return "";

  const texts = [];

  for (const item of out) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;

    for (const c of content) {
      // ドキュメント上は output の中に text が入る  [oai_citation:1‡OpenAI Platform](https://platform.openai.com/docs/guides/text?utm_source=chatgpt.com)
      if (c?.type === "output_text" && typeof c?.text === "string") {
        texts.push(c.text);
      } else if (c?.type === "text" && typeof c?.text === "string") {
        texts.push(c.text);
      }
      // 念のため: まれに text がオブジェクトのことがある
      else if (c?.type === "output_text" && c?.text?.value) {
        texts.push(String(c.text.value));
      }
    }
  }

  return texts.join("\n").trim();
}

async function callOpenAI(pr, diff) {
  const prompt = `
あなたは熟練したソフトウェアエンジニアです。以下のPull Requestをレビューしてください。

## PRタイトル
${pr.title}

## PR本文
${pr.body || "(なし)"}

## 変更差分（diff）
${trimDiff(diff)}

観点:
- バグ/落とし穴（境界条件、例外、NULL、互換性）
- 保守性/可読性（命名、責務、重複）
- セキュリティ（ログ、入力検証、権限、情報漏えい）
- テスト観点（追加すべきテスト、確認ポイント）

トーン:
- 丁寧で建設的
- 不確かな点は推測と明記
- 初心者にも学びがある書き方

Markdownで出力してください。
`.trim();

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      // お好み: ログ/保存を減らしたいなら
      // store: false
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text}`);
  }

  const data = await res.json();

  const text = extractOutputText(data);

  // デバッグ（必要なときだけON。普段はコメントアウト推奨）
  if (!text) {
    console.log("OpenAI raw response (no extracted text):");
    console.log(JSON.stringify(data, null, 2));
  }

  return text;
}

async function postComment(body) {
  await gh(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      body: `### 🤖 AI Review\n\n${body}\n\n---\n_Triggered by AI Review Action_`,
    }),
  });
}

(async () => {
  const pr = await getPR();
  const diff = await getDiff();
  const review = await callOpenAI(pr, diff);

  const finalBody =
    review && review.trim()
      ? review.trim()
      : "（AIレビュー生成に失敗しました：モデル出力テキストを抽出できませんでした。Actionsログの OpenAI raw response を確認してください）";

  await postComment(finalBody);
  console.log("AI review posted.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
