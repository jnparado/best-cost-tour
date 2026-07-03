import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ label, value, subtext, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {subtext && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend === "up" && "text-emerald-600",
            trend === "down" && "text-red-600",
            (!trend || trend === "neutral") && "text-slate-500"
          )}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
