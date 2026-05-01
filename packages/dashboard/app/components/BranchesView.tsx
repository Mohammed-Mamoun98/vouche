"use client";

import { BRANCH_STATS } from "../data";
import { PageHeader } from "./PageHeader";

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-accent-dim text-accent",
  stale: "bg-yellow-dim text-yellow",
  merged: "bg-subtle text-dim",
};

export function BranchesView() {
  return (
    <>
      <PageHeader
        title="Branches"
        description="All branches with review activity"
      />

      <div className="flex flex-col gap-2">
        {BRANCH_STATS.map((branch) => (
          <div
            key={branch.name}
            className="bg-surface border border-edge rounded-lg px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-elevated transition-colors duration-150"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[13px] font-medium text-text">
                  {branch.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-[3px] uppercase tracking-wide ${
                    STATUS_CLASSES[branch.status] ?? ""
                  }`}
                >
                  {branch.status}
                </span>
              </div>
              <div className="text-[11px] text-dim">
                <span>{branch.session_count} sessions</span>
                <span className="mx-1">·</span>
                <span>Last activity {branch.last_activity}</span>
              </div>
            </div>
            <div className="flex">
              {branch.contributors.map((dev, idx) => (
                <div
                  key={dev.id}
                  className={`w-[22px] h-[22px] rounded-full bg-subtle border border-edge-strong flex items-center justify-center text-[9px] font-medium text-muted shrink-0 ${
                    idx > 0 ? "-ml-1.5" : ""
                  }`}
                  title={dev.name}
                >
                  {dev.initials}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
