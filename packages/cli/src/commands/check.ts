import { performance } from "node:perf_hooks";
import { loadConfig } from "../lib/config";
import { getDiff, getDiffMeta } from "../lib/diff";
import { createAdapter } from "../lib/ai";
import { runAudit } from "../lib/audit";
import { reportSession, getCurrentBranch } from "../lib/session";
import { execSync } from "node:child_process";

export async function checkCommand(): Promise<void> {
  const startTime = performance.now();

  const config = await loadConfig();
  const diff = await getDiff();
  const meta = getDiffMeta(diff);

  if (meta.files.length === 0) {
    console.log("\nvouch: no changes to review — skipping.");
    process.exit(0);
  }

  console.log(`\nvouch: reviewing ${meta.files.length} file(s) (${meta.additions}+ ${meta.deletions}-)\n`);

  const adapter = createAdapter(config);

  const audit = await runAudit(diff, config, adapter);

  const duration = Math.round((performance.now() - startTime) / 1000);

  const branch = getCurrentBranch();
  let commitSha = "";
  let commitMessage = "";

  try {
    commitSha = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
    commitMessage = execSync("git log -1 --format=%s", { encoding: "utf-8" }).trim();
  } catch {
    // Not a fatal error if we can't get commit info
  }

  if (audit.outcome === "pass") {
    console.log(`\nvouch: ✅ passed (${audit.confidence_score}/100)\n`);
  } else {
    console.log(`\nvouch: ❌ flagged (${audit.confidence_score}/100)\n`);
    for (const q of audit.questions) {
      console.log(`  Q: ${q.question}`);
      console.log(`  A: ${q.answer}`);
      console.log(`  Score: ${q.score}/100\n`);
    }
  }

  // Report analytics (silent if not configured)
  await reportSession({
    branch,
    commit_sha: commitSha,
    commit_message: commitMessage,
    diff_summary: `${meta.files.length} file(s), +${meta.additions} -${meta.deletions}`,
    model_used: `${config.provider}/${config.model}`,
    outcome: audit.outcome,
    confidence_score: audit.confidence_score,
    duration_seconds: duration,
  });

  process.exit(audit.outcome === "pass" ? 0 : 1);
}
