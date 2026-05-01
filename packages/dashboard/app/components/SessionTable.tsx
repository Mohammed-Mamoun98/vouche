"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import type { Session } from "../types";

interface SessionTableProps {
  sessions: Session[];
  showConfidence?: boolean;
  onSelectSession: (sessionId: string) => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

const columnHelper = createColumnHelper<Session>();

const OUTCOME_STYLES: Record<Session["outcome"], string> = {
  pass: "bg-accent-dim text-accent",
  flag: "bg-yellow-dim text-yellow",
  skip: "bg-subtle text-dim",
};

const OUTCOME_LABELS: Record<Session["outcome"], string> = {
  pass: "✓ Pass",
  flag: "⚠ Flag",
  skip: "— Skip",
};

function OutcomeBadge({ outcome }: { outcome: Session["outcome"] }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-medium ${OUTCOME_STYLES[outcome]}`}
    >
      {OUTCOME_LABELS[outcome]}
    </span>
  );
}

function ConfidenceCell({ score }: { score: number }) {
  const colorClass =
    score >= 0.85 ? "text-accent" : score >= 0.7 ? "text-yellow" : "text-red";
  return (
    <span className={`font-mono text-[12px] ${colorClass}`}>
      {Math.round(score * 100)}%
    </span>
  );
}

export function SessionTable({
  sessions,
  showConfidence = true,
  onSelectSession,
}: SessionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    columnHelper.accessor((row) => row.developer, {
      id: "developer",
      header: "Author",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-subtle border border-edge-strong flex items-center justify-center text-[10px] font-medium text-muted shrink-0">
            {info.getValue().initials}
          </div>
          <span className="text-[13px] text-text">{info.getValue().name}</span>
        </div>
      ),
    }),
    columnHelper.accessor("branch", {
      header: "Branch",
      cell: (info) => (
        <span className="font-mono text-[12px] text-text">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("commit_sha", {
      header: "Commit",
      cell: (info) => (
        <code className="text-[11px] text-muted">{info.getValue()}</code>
      ),
    }),
    columnHelper.accessor("commit_message", {
      header: "Message",
      cell: (info) => (
        <span className="text-[12px] text-muted truncate max-w-[200px] block">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("outcome", {
      header: "Outcome",
      cell: (info) => <OutcomeBadge outcome={info.getValue()} />,
    }),
    ...(showConfidence
      ? [
          columnHelper.accessor("confidence_score", {
            id: "confidence",
            header: "Confidence",
            cell: (info) => <ConfidenceCell score={info.getValue()} />,
          }),
        ]
      : []),
    columnHelper.accessor("duration_seconds", {
      header: "Duration",
      cell: (info) => (
        <span className="text-[12px] text-muted">
          {formatDuration(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Time",
      cell: (info) => (
        <span className="text-[12px] text-dim">{info.getValue()}</span>
      ),
    }),
  ];

  const table = useReactTable({
    data: sessions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-surface border border-edge rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-edge">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left text-[10px] text-dim uppercase tracking-wide font-medium px-4 py-2.5 bg-elevated"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                role="button"
                onClick={() => onSelectSession(row.original.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectSession(row.original.id);
                  }
                }}
                className="border-b border-edge last:border-b-0 cursor-pointer hover:bg-elevated transition-colors duration-150"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
