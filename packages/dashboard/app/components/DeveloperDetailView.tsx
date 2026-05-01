"use client";

import { SESSIONS } from "../data";
import type { Developer } from "../types";
import { BackButton } from "./BackButton";
import { SessionTable } from "./SessionTable";

interface DeveloperDetailViewProps {
  developer: Developer;
  onSelectSession: (sessionId: string) => void;
}

export function DeveloperDetailView({
  developer,
  onSelectSession,
}: DeveloperDetailViewProps) {
  const devSessions = SESSIONS.filter((s) => s.developer.id === developer.id);

  const stats = {
    total: devSessions.length,
    passed: devSessions.filter((s) => s.outcome === "pass").length,
    flagged: devSessions.filter((s) => s.outcome === "flag").length,
    skipped: devSessions.filter((s) => s.outcome === "skip").length,
    avgConfidence:
      devSessions.length > 0
        ? devSessions.reduce((sum, s) => sum + s.confidence_score, 0) /
          devSessions.length
        : 0,
  };

  return (
    <>
      <BackButton className="mb-4" />

      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-subtle border border-edge-strong flex items-center justify-center text-lg font-medium text-muted">
          {developer.initials}
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-text flex items-center gap-2">
            {developer.name}
            {developer.role === "admin" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-[3px] bg-accent-dim text-accent uppercase tracking-wide">
                Admin
              </span>
            )}
          </h1>
          <p className="text-[13px] text-dim">@{developer.username}</p>
        </div>
      </div>

      <div className="flex gap-6 mb-6 p-4 bg-surface border border-edge rounded-lg">
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-semibold text-text">{stats.total}</span>
          <span className="text-[11px] text-dim uppercase tracking-wide">
            Total Reviews
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-semibold text-accent">
            {stats.passed}
          </span>
          <span className="text-[11px] text-dim uppercase tracking-wide">
            Passed
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-semibold text-yellow">
            {stats.flagged}
          </span>
          <span className="text-[11px] text-dim uppercase tracking-wide">
            Flagged
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-semibold text-text">
            {stats.skipped}
          </span>
          <span className="text-[11px] text-dim uppercase tracking-wide">
            Skipped
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-semibold text-text">
            {Math.round(stats.avgConfidence * 100)}%
          </span>
          <span className="text-[11px] text-dim uppercase tracking-wide">
            Avg Confidence
          </span>
        </div>
      </div>

      {devSessions.length > 0 ? (
        <SessionTable
          sessions={devSessions}
          onSelectSession={onSelectSession}
        />
      ) : (
        <div className="text-center py-10 text-dim text-[13px]">
          No review sessions yet
        </div>
      )}
    </>
  );
}
