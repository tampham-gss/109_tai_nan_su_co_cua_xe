import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";

import {
  FILTER_CONTROL_HEIGHT_CLASS,
  FILTER_CONTROL_TRIGGER_CLASS,
  INPUT_FIELD_BORDER_CLASS,
  SELECT_TRIGGER_BORDER_CLASS,
} from "../styles/fieldStyles";
import { cn } from "./ui";

export type FilterAutocompleteOption = {
  id: string;
  label: string;
  sublabel?: string;
};

type FilterAutocompleteProps = {
  value: string;
  options: FilterAutocompleteOption[];
  onChange: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  className?: string;
  "aria-label": string;
};

const triggerClass = cn(
  FILTER_CONTROL_TRIGGER_CLASS,
  SELECT_TRIGGER_BORDER_CLASS,
  "flex justify-between gap-2 px-3"
);

const searchControlClass = cn(
  FILTER_CONTROL_HEIGHT_CLASS,
  INPUT_FIELD_BORDER_CLASS,
  "flex items-center px-3"
);

export default function FilterAutocomplete({
  value,
  options,
  onChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  searchable = true,
  className,
  "aria-label": ariaLabel,
}: FilterAutocompleteProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.id === value);

  const displayOptions = useMemo(() => {
    if (!searchable) return options;
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.sublabel ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(triggerClass, !selected && "text-gray-400")}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate text-left text-gray-900">{selected?.label ?? placeholder}</span>
        <LuChevronDown className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {searchable ? (
            <div className="border-b border-gray-100 p-2">
              <div className={searchControlClass}>
                <LuSearch className="mr-2 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <input
                  type="search"
                  aria-label={searchPlaceholder}
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none"
                  placeholder={searchPlaceholder}
                  value={query}
                  autoFocus
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
          ) : null}
          <ul id={listboxId} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {displayOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">Không tìm thấy kết quả</li>
            ) : (
              displayOptions.map((option) => (
                <li key={option.id} role="option" aria-selected={option.id === value}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-gray-50",
                      option.id === value && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => handleSelect(option.id)}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.sublabel ? (
                      <span className="text-xs text-gray-500">{option.sublabel}</span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
