import { createInterface } from "node:readline";
import type { AIAdapter } from "./ai";
import type { Outcome, VouchConfig } from "@vouch/shared";

export async function generateQuestions(
  diff: string,
  adapter: AIAdapter,
): Promise<string[]> {
  const response = await adapter.chat([
    {
      role: "system",
      content:
        "You are a senior software engineer conducting a code review interview. Analyze the following git diff and generate 2-3 targeted questions to verify the developer understands the changes. Focus on logic, security implications, and failure modes. Return only a JSON array of question strings, nothing else.",
    },
    { role: "user", content: `Here is the diff:\n\n${diff}` },
  ]);

  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  diff: string,
  adapter: AIAdapter,
): Promise<{ score: number; followUp?: string }> {
  const response = await adapter.chat([
    {
      role: "system",
      content:
        "You are evaluating a developer's understanding of their code change. Score their answer from 0-100 based on accuracy and depth. Return JSON: { score: number, followUp?: string } where followUp is an optional clarifying question if the answer was vague.",
    },
    {
      role: "user",
      content: `Diff:\n${diff}\n\nQuestion: ${question}\n\nAnswer: ${answer}`,
    },
  ]);

  try {
    return JSON.parse(response);
  } catch {
    return { score: 50 };
  }
}

export async function runAudit(
  diff: string,
  config: VouchConfig,
  adapter: AIAdapter,
): Promise<{
  outcome: Outcome;
  confidence_score: number;
  questions: Array<{ question: string; answer: string; score: number }>;
}> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, resolve));

  const questionTexts = await generateQuestions(diff, adapter);
  const results: Array<{ question: string; answer: string; score: number }> =
    [];
  const scores: number[] = [];

  for (let i = 0; i < questionTexts.length; i++) {
    const q = questionTexts[i];
    console.log(`\n  Q${i + 1}: ${q}`);
    const answer = await ask("  → ");

    const evaluation = await evaluateAnswer(q, answer, diff, adapter);
    scores.push(evaluation.score);
    results.push({ question: q, answer, score: evaluation.score });

    if (evaluation.followUp) {
      console.log(`\n  Follow-up: ${evaluation.followUp}`);
      const followAnswer = await ask("  → ");
      const followEval = await evaluateAnswer(
        evaluation.followUp,
        followAnswer,
        diff,
        adapter,
      );
      scores.push(followEval.score);
      results.push({
        question: evaluation.followUp,
        answer: followAnswer,
        score: followEval.score,
      });
    }
  }

  rl.close();

  const confidence_score =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const outcome: Outcome = confidence_score >= 60 ? "pass" : "flag";

  return { outcome, confidence_score, questions: results };
}
