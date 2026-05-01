"use client";

import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { DeveloperDetailView } from "../../components/DeveloperDetailView";
import { DEVELOPERS } from "../../data";
import type { Developer } from "../../types";

interface DeveloperDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DeveloperDetailPage({
  params,
}: DeveloperDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const developer = DEVELOPERS.find((d: Developer) => d.id === id);

  if (!developer) {
    notFound();
  }

  return (
    <DeveloperDetailView
      developer={developer}
      onSelectSession={(sessionId) => router.push(`/sessions/${sessionId}`)}
    />
  );
}
