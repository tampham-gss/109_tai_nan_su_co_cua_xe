import type { ReactNode } from "react";

import { cn } from "./ui";

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
  placement?: "top" | "bottom";
};

export function Tooltip({ label, children, className, placement = "top" }: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function getDriverSummaryRowTooltip(driverName: string, isExpanded: boolean): string {
  return isExpanded
    ? `${driverName} — Nhấn để thu gọn chi tiết xe chạy`
    : `${driverName} — Nhấn để xem chi tiết xe chạy`;
}
