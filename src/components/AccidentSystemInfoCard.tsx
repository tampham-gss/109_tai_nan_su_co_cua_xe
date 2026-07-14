import { useState } from "react";
import { LuSettings } from "react-icons/lu";

import type { AccidentActivityChange, AccidentActivityLog } from "../types";
import { ACTIVITY_VISIBLE_FIELD_LIMIT } from "../utils/activityUtils";
import { formatActivityTimestamp } from "../utils/dateUtils";
import { cn } from "./ui";

type AccidentSystemInfoCardProps = {
  logs: AccidentActivityLog[];
  className?: string;
};

function formatActionLabel(action: AccidentActivityLog["action"]): string {
  if (action === "CREATED") return "Tạo bản ghi";
  return "Cập nhật bản ghi";
}

function FieldChangeBlock({ change }: { change: AccidentActivityChange }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-bold break-words text-slate-900">{change.fieldLabel}</p>
      <div className="mb-2 min-w-0">
        <p className="text-[11px] text-slate-400">Giá trị cũ</p>
        <p className="mt-0.5 break-words text-xs text-slate-600">{change.oldValue}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">Giá trị mới</p>
        <p className="mt-0.5 break-words text-xs font-medium text-blue-600">{change.newValue}</p>
      </div>
    </div>
  );
}

function ExpandableFieldChanges({
  changes,
  logId,
}: {
  changes: AccidentActivityChange[];
  logId: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (changes.length === 0) return null;

  const visible = expanded ? changes : changes.slice(0, ACTIVITY_VISIBLE_FIELD_LIMIT);
  const hiddenCount = changes.length - ACTIVITY_VISIBLE_FIELD_LIMIT;

  return (
    <div className="mt-2 min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="space-y-3">
        {visible.map((change) => (
          <FieldChangeBlock key={`${logId}-${change.field}`} change={change} />
        ))}
      </div>
      {changes.length > ACTIVITY_VISIBLE_FIELD_LIMIT ? (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Ẩn bớt" : `Xem thêm ${hiddenCount} trường`}
        </button>
      ) : null}
    </div>
  );
}

export default function AccidentSystemInfoCard({ logs, className }: AccidentSystemInfoCardProps) {
  return (
    <aside
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <div className="shrink-0 border-b border-slate-200 px-4 py-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <LuSettings className="h-4 w-4 text-slate-400" aria-hidden />
          Thông tin hệ thống
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có thông tin hệ thống</p>
        ) : (
          <ul>
            {logs.map((log, index) => (
              <li
                key={log.id}
                className={cn("relative min-w-0 pl-6", index < logs.length - 1 ? "pb-6" : "pb-0")}
              >
                <span
                  className="absolute top-1.5 left-0 size-[11px] rounded-full bg-blue-500 ring-2 ring-white"
                  aria-hidden
                />
                {index < logs.length - 1 ? (
                  <span
                    className="absolute top-4 bottom-0 left-[5px] w-px -translate-x-1/2 bg-slate-200"
                    aria-hidden
                  />
                ) : null}
                <p className="text-sm font-semibold text-slate-900">
                  {formatActivityTimestamp(log.createdAt)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {log.actorName} {formatActionLabel(log.action)}
                </p>
                {log.action === "UPDATED" && log.changes.length > 0 ? (
                  <ExpandableFieldChanges changes={log.changes} logId={log.id} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
