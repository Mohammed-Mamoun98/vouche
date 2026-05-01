"use client";

import type { Session } from "../types";
import { BackButton } from "./BackButton";

interface SessionDetailViewProps {
  session: Session;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

const OUTCOME_STYLES: Record<string, string> = {
  pass: "bg-accent-dim text-accent",
  flag: "bg-yellow-dim text-yellow",
  skip: "bg-subtle text-dim",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "text-accent",
  mid: "text-yellow",
  low: "text-red",
};

function confidenceLevel(score: number): string {
  return score >= 0.85 ? "high" : score >= 0.7 ? "mid" : "low";
}

export function SessionDetailView({ session }: SessionDetailViewProps) {
  return (
    <>
      <BackButton className="mb-4" />

      <div className="bg-surface border border-edge rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-edge">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-subtle border border-edge-strong flex items-center justify-center text-sm font-medium text-muted">
              {session.developer.initials}
            </div>
            <div>
              <div className="text-sm font-medium text-text">
                {session.developer.name}
              </div>
              <div className="text-xs text-dim">
                @{session.developer.username}
              </div>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-[4px] text-[11px] font-medium ${
              OUTCOME_STYLES[session.outcome] ?? ""
            }`}
          >
            {session.outcome === "pass" && "✓ Pass"}
            {session.outcome === "flag" && "⚠ Flag"}
            {session.outcome === "skip" && "— Skip"}
          </div>
        </div>

        <div className="grid grid-cols-5 divide-x divide-edge border-b border-edge">
          <div className="flex flex-col gap-1 p-3 px-4">
            <span className="text-[10px] text-dim uppercase tracking-wide">
              Branch
            </span>
            <code className="font-mono text-[11px] text-text bg-elevated px-1.5 py-0.5 rounded-[3px] self-start">
              {session.branch}
            </code>
          </div>
          <div className="flex flex-col gap-1 p-3 px-4">
            <span className="text-[10px] text-dim uppercase tracking-wide">
              Commit
            </span>
            <code className="text-xs text-text">{session.commit_sha}</code>
          </div>
          <div className="flex flex-col gap-1 p-3 px-4">
            <span className="text-[10px] text-dim uppercase tracking-wide">
              Confidence
            </span>
            <span
              className={`font-mono text-[11px] ${
                CONFIDENCE_STYLES[confidenceLevel(session.confidence_score)] ??
                ""
              }`}
            >
              {Math.round(session.confidence_score * 100)}%
            </span>
          </div>
          <div className="flex flex-col gap-1 p-3 px-4">
            <span className="text-[10px] text-dim uppercase tracking-wide">
              Duration
            </span>
            <span className="text-xs text-text">
              {formatDuration(session.duration_seconds)}
            </span>
          </div>
          <div className="flex flex-col gap-1 p-3 px-4">
            <span className="text-[10px] text-dim uppercase tracking-wide">
              Time
            </span>
            <span className="text-xs text-text">{session.created_at}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] text-dim uppercase tracking-wide">
            Commit Message
          </div>
          <p className="text-[13px] text-text mt-2 leading-relaxed">
            {session.commit_message}
          </p>
        </div>
      </div>
    </>
  );
}
