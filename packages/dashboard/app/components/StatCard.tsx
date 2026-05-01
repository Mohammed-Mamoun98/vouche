import type { StatCard as StatCardData } from "../types";

interface StatCardProps {
  label: StatCardData["label"];
  value: StatCardData["value"];
  change?: StatCardData["change"];
  trend?: StatCardData["trend"];
}

export function StatCard({ label, value, change, trend }: StatCardProps) {
  const trendColor =
    trend === "up" ? "text-accent" : trend === "down" ? "text-red" : "text-dim";

  return (
    <div className="bg-surface border border-edge rounded-lg px-4 py-3.5">
      <div className="text-[11px] text-dim uppercase tracking-wide mb-1.5">
        {label}
      </div>
      <div className="text-[22px] font-semibold text-text leading-tight">
        {value}
      </div>
      {change && (
        <div className={`text-[11px] mt-1 ${trendColor}`}>
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
          {change}
        </div>
      )}
    </div>
  );
}
