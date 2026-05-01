"use client";

import { useRouter } from "next/navigation";
import { DEVELOPERS, SESSIONS } from "../data";
import { PageHeader } from "./PageHeader";

export function DevelopersView() {
  const router = useRouter();

  function getDevStats(devId: string) {
    const devSessions = SESSIONS.filter((s) => s.developer.id === devId);
    const passed = devSessions.filter((s) => s.outcome === "pass").length;
    const avgConfidence =
      devSessions.length > 0
        ? devSessions.reduce((sum, s) => sum + s.confidence_score, 0) /
          devSessions.length
        : 0;
    return { sessions: devSessions.length, passed, avgConfidence };
  }

  return (
    <>
      <PageHeader
        title="Developers"
        description="Team members and their review activity"
      />

      <div className="grid grid-cols-2 gap-2.5">
        {DEVELOPERS.map((dev) => {
          const stats = getDevStats(dev.id);
          return (
            <button
              key={dev.id}
              type="button"
              className="bg-surface border border-edge rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:bg-elevated transition-colors duration-150 text-left font-[inherit]"
              onClick={() => router.push(`/developers/${dev.id}`)}
            >
              <div className="w-10 h-10 rounded-full bg-subtle border border-edge-strong flex items-center justify-center text-sm font-medium text-muted">
                {dev.initials}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[13px] font-medium text-text flex items-center gap-1.5">
                  {dev.name}
                  {dev.role === "admin" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-[3px] bg-accent-dim text-accent uppercase tracking-wide">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-dim">@{dev.username}</div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-text">
                    {stats.sessions}
                  </span>
                  <span className="text-[10px] text-dim uppercase tracking-wide">
                    Reviews
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-text">
                    {stats.passed}
                  </span>
                  <span className="text-[10px] text-dim uppercase tracking-wide">
                    Passed
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-text">
                    {Math.round(stats.avgConfidence * 100)}%
                  </span>
                  <span className="text-[10px] text-dim uppercase tracking-wide">
                    Avg Conf
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
