"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  fallbackHref?: string;
}

export function BackButton({ className = "", fallbackHref = "/" }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`border-none bg-transparent text-muted text-xs cursor-pointer px-0 py-1 flex items-center gap-1 hover:text-text ${className}`}
    >
      ← Back
    </button>
  );
}
