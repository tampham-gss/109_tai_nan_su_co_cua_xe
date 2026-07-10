import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LuCalendar, LuChevronLeft, LuChevronRight } from "react-icons/lu";

import {
  FILTER_CONTROL_HEIGHT_CLASS,
  FILTER_CONTROL_TRIGGER_CLASS,
  INPUT_FIELD_BORDER_CLASS,
} from "../styles/fieldStyles";
import { formatViDate } from "../utils/dateUtils";
import { cn } from "./ui";

type ViDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
};

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function parseIsoDate(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function mondayBasedWeekday(year: number, month: number, day: number): number {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 ? 6 : weekday - 1;
}

function isDateDisabled(isoDate: string, min?: string, max?: string): boolean {
  if (min && isoDate < min) return true;
  if (max && isoDate > max) return true;
  return false;
}

function buildMonthCells(viewYear: number, viewMonth: number) {
  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingEmpty = mondayBasedWeekday(viewYear, viewMonth, 1);
  const cells: Array<{ isoDate: string | null; day: number | null }> = [];

  for (let index = 0; index < leadingEmpty; index += 1) {
    cells.push({ isoDate: null, day: null });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ isoDate: toIsoDate(viewYear, viewMonth, day), day });
  }

  return cells;
}

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

const triggerClass = cn(
  FILTER_CONTROL_TRIGGER_CLASS,
  INPUT_FIELD_BORDER_CLASS,
  "flex items-center justify-between gap-2 px-3"
);

export default function ViDatePicker({
  value,
  onChange,
  min,
  max,
  id,
  className,
  placeholder = "Chọn ngày",
  "aria-label": ariaLabel,
}: ViDatePickerProps) {
  const popupId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = value ? parseIsoDate(value) : null;
  const [viewYear, setViewYear] = useState(selected?.year ?? 2026);
  const [viewMonth, setViewMonth] = useState(selected?.month ?? 7);

  useEffect(() => {
    if (!value) return;
    const next = parseIsoDate(value);
    setViewYear(next.year);
    setViewMonth(next.month);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const monthCells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewMonth, viewYear]
  );

  const monthLabel = `Tháng ${viewMonth}/${viewYear}`;

  const selectDate = (isoDate: string) => {
    if (isDateDisabled(isoDate, min, max)) return;
    onChange(isoDate);
    setOpen(false);
  };

  const goToPreviousMonth = () => {
    const next = shiftMonth(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const goToNextMonth = () => {
    const next = shiftMonth(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popupId}
        className={triggerClass}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={cn("truncate text-left", value ? "text-gray-900" : "text-gray-400")}>
          {value ? formatViDate(value) : placeholder}
        </span>
        <LuCalendar className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
      </button>

      {open ? (
        <div
          id={popupId}
          role="dialog"
          aria-label="Chọn ngày"
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-[280px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Tháng trước"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
              onClick={goToPreviousMonth}
            >
              <LuChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
            <button
              type="button"
              aria-label="Tháng sau"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
              onClick={goToNextMonth}
            >
              <LuChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-1 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((cell, index) => {
              if (!cell.isoDate || cell.day === null) {
                return <div key={`empty-${index}`} className={FILTER_CONTROL_HEIGHT_CLASS} />;
              }

              const isSelected = cell.isoDate === value;
              const disabled = isDateDisabled(cell.isoDate, min, max);

              return (
                <button
                  key={cell.isoDate}
                  type="button"
                  disabled={disabled}
                  aria-label={formatViDate(cell.isoDate)}
                  aria-pressed={isSelected}
                  className={cn(
                    FILTER_CONTROL_HEIGHT_CLASS,
                    "rounded-md text-sm tabular-nums transition-colors",
                    disabled && "cursor-not-allowed text-gray-300",
                    !disabled && !isSelected && "text-gray-700 hover:bg-blue-50 hover:text-blue-700",
                    isSelected && "bg-blue-600 font-semibold text-white hover:bg-blue-600"
                  )}
                  onClick={() => selectDate(cell.isoDate!)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
