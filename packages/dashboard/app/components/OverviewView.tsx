"use client";

import { useRouter } from "next/navigation";
import { SESSIONS, STATS } from "../data";
import { PageHeader } from "./PageHeader";
import { SessionTable } from "./SessionTable";
import { StatCard } from "./StatCard";

export function OverviewView() {
  const router = useRouter();
  const recentSessions = SESSIONS.slice(0, 6);

  function handleSelectSession(sessionId: string) {
    router.push(`/sessions/${sessionId}`);
  }

  return (
    <>
      <PageHeader
        title="Overview"
        description="Your team's code review activity"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        <StatCard
          label="Total Reviews"
          value={STATS.totalReviews}
          change="+12 this week"
          trend="up"
        />
        <StatCard label="Passed" value={STATS.passed} change="83%" trend="up" />
        <StatCard
          label="Flagged"
          value={STATS.flagged}
          change="13%"
          trend="neutral"
        />
        <StatCard
          label="Avg Confidence"
          value={`${Math.round(STATS.avgConfidence * 100)}%`}
          change="+2%"
          trend="up"
        />
      </div>

      <PageHeader title="Recent Reviews" />
      <SessionTable
        sessions={recentSessions}
        onSelectSession={handleSelectSession}
      />
    </>
  );
}
