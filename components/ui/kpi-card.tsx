import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, icon, trend, className }: KPICardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
        {trend && (
          <div className={cn("text-[13px] font-medium", trend.isPositive ? "text-status-green" : "text-status-red")}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
