import type { ReactNode } from "react";
import type { IconType } from "react-icons";

import {
  FILTER_CONTROL_HEIGHT_CLASS,
  FILTER_CONTROL_TRIGGER_CLASS,
  INPUT_FIELD_BORDER_CLASS,
  SELECT_TRIGGER_BORDER_CLASS,
} from "../styles/fieldStyles";
import ViDateInput from "./ViDateInput";
import ViDatePicker from "./ViDatePicker";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type FilterFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  items: { id: string; label: string }[];
  disabled?: boolean;
  className?: string;
  "aria-label": string;
};

const selectClass = cn(FILTER_CONTROL_TRIGGER_CLASS, SELECT_TRIGGER_BORDER_CLASS, "px-3");

export function FilterSelect({
  value,
  onChange,
  items,
  disabled,
  className,
  "aria-label": ariaLabel,
}: FilterSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      className={cn(selectClass, className ?? "w-full")}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

type DateInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  inputClassName?: string;
};

export function DateInput({ label, value, onChange, min, max, className, inputClassName }: DateInputProps) {
  return (
    <FilterField label={label} className={className}>
      <ViDateInput
        aria-label={label}
        className={cn(FILTER_CONTROL_HEIGHT_CLASS, INPUT_FIELD_BORDER_CLASS, "px-3", inputClassName ?? "w-full")}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
      />
    </FilterField>
  );
}

type DatePickerInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  inputClassName?: string;
};

export function DatePickerInput({
  label,
  value,
  onChange,
  min,
  max,
  className,
  inputClassName,
}: DatePickerInputProps) {
  return (
    <FilterField label={label} className={className}>
      <ViDatePicker
        aria-label={label}
        className={inputClassName ?? "w-full"}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
      />
    </FilterField>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="shrink-0 text-2xl font-bold text-gray-900">{children}</h1>;
}

export function FeaturePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-gray-50 p-4">
      <div className="mx-auto flex min-h-0 w-full max-w-full flex-1 flex-col gap-4">{children}</div>
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-gray-200 bg-white", className)}>{children}</section>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 p-4", className)}>{children}</div>;
}

export type KpiItem = {
  key: string;
  label: string;
  value: string | number;
  icon: IconType;
  valueClass?: string;
  iconClass?: string;
};

const KPI_CARD_SHELL = "h-full w-full gap-0 rounded-lg border border-gray-200 bg-white p-0 shadow-none";

function kpiGridColumnsClass(itemCount: number): string {
  if (itemCount <= 2) return "grid-cols-2";
  if (itemCount === 3) return "grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2 lg:grid-cols-4";
}

export function KpiCardsGrid({ items, className }: { items: KpiItem[]; className?: string }) {
  return (
    <div className={cn("grid w-full items-stretch gap-3", kpiGridColumnsClass(items.length), className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className={KPI_CARD_SHELL}>
            <div className="flex flex-1 justify-center gap-2 px-4 py-3">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600">{item.label}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-xl leading-tight font-bold tabular-nums",
                      item.valueClass ?? "text-gray-900"
                    )}
                  >
                    {item.value}
                  </p>
                </div>
                <Icon className={cn("h-6 w-6 shrink-0", item.iconClass ?? "text-blue-600")} aria-hidden />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OutlineButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        FILTER_CONTROL_HEIGHT_CLASS,
        "inline-flex items-center justify-center rounded-lg border border-solid border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        FILTER_CONTROL_HEIGHT_CLASS,
        "inline-flex items-center justify-center rounded-lg border border-solid border-blue-600 bg-blue-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        FILTER_CONTROL_HEIGHT_CLASS,
        "inline-flex items-center justify-center rounded-lg border border-solid border-red-200 bg-white px-3 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export const tableHeaderClass =
  "px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase";

export const tableHeaderCenterClass =
  "px-4 py-3 text-center text-xs font-semibold tracking-wide text-slate-600 uppercase";

export const tableBodyClass = "px-4 py-3 text-slate-700";

export const tableRowClass =
  "h-12 border-b border-slate-100 outline-none last:border-b-0 hover:bg-slate-50/60";

export const inputClass = cn(FILTER_CONTROL_HEIGHT_CLASS, INPUT_FIELD_BORDER_CLASS, "px-3");

export const textareaClass = cn(
  INPUT_FIELD_BORDER_CLASS,
  "min-h-[5rem] resize-y px-3 py-2 text-sm"
);
