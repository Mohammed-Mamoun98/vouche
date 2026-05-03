import { readFileSync } from "node:fs";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const PR_DIFF_PATH = process.env.PR_DIFF_PATH;
const GH_TOKEN = process.env.GH_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;

if (!DEEPSEEK_API_KEY || !PR_DIFF_PATH || !GH_TOKEN || !PR_NUMBER) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const diff = readFileSync(PR_DIFF_PATH, "utf-8").trim();
if (!diff) {
  console.log("No diff to review");
  process.exit(0);
}

const systemPrompt = `You are a senior software engineer reviewing a pull request. Analyze the diff and provide feedback on:

1. **Correctness** — logic errors, edge cases, race conditions
2. **Security** — injection, auth, data exposure, dependency risks
3. **Performance** — unnecessary work, memory leaks, N+1 queries
4. **Maintainability** — confusing code, missing error handling, over-engineering
5. **Type Safety** — any unsafe casts, missing types, or type holes

Format your review as bullet points grouped by category. For each issue, prefix with:
- [BLOCKER] if it will cause incorrect behavior or is a security risk
- [WARNING] if it's a significant concern but not immediately blocking
- [NIT] for minor style or preference issues

If the changes look good, say so clearly. Be thorough but concise. Focus on what matters.`;

async function review() {
  console.log("Sending diff to DeepSeek for review...");

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-reasoner",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Review this pull request diff:\n\n\`\`\`diff\n${diff}\n\`\`\``,
        },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const reviewBody = data.choices[0]?.message?.content;

  if (!reviewBody) {
    throw new Error("Empty response from DeepSeek");
  }

  console.log("Posting review to PR...");

  const ownerRepo = process.env.GITHUB_REPOSITORY;
  const commentBody = `## AI Code Review\n\n${reviewBody}\n\n---\n*Powered by DeepSeek*`;

  const commentResponse = await fetch(
    `https://api.github.com/repos/${ownerRepo}/issues/${PR_NUMBER}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({ body: commentBody }),
    },
  );

  if (!commentResponse.ok) {
    const error = await commentResponse.text();
    throw new Error(`GitHub API error (${commentResponse.status}): ${error}`);
  }

  console.log("Review posted successfully");
}

review().catch((err) => {
  console.error("Review failed:", err.message);
  process.exit(1);
});
