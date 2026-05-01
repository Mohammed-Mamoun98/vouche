"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { SessionDetailView } from "../../components/SessionDetailView";
import { SESSIONS } from "../../data";
import type { Session } from "../../types";

interface SessionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = use(params);

  const session = SESSIONS.find((s: Session) => s.id === id);

  if (!session) {
    notFound();
  }

  return <SessionDetailView session={session} />;
}
