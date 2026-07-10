import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";

import ModalFieldError from "./modal/ModalFieldError";
import ModalFieldLabel from "./modal/ModalFieldLabel";
import { cn } from "./ui";
import {
  MODAL_FIELD_ROOT_CLASS,
  MODAL_SEARCH_CONTROL_CLASS,
  MODAL_SELECT_TRIGGER_CLASS,
} from "../styles/modalStyles";

export type AutocompleteOption = {
  id: string;
  label: string;
  sublabel?: string;
};

type AutocompleteFieldProps = {
  label: string;
  value: string;
  options: AutocompleteOption[];
  onChange: (id: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  hint?: string;
  required?: boolean;
  error?: string;
  showError?: boolean;
  className?: string;
};

export default function AutocompleteField({
  label,
  value,
  options,
  onChange,
  onBlur,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  searchable = true,
  hint,
  required,
  error,
  showError,
  className,
}: AutocompleteFieldProps) {
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
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onBlur, open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
    onBlur?.();
  };

  return (
    <div className={cn(MODAL_FIELD_ROOT_CLASS, className)}>
      <ModalFieldLabel required={required}>{label}</ModalFieldLabel>
      <div ref={rootRef} className="relative w-full">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-invalid={showError && !!error}
          className={cn(
            MODAL_SELECT_TRIGGER_CLASS,
            !selected && "text-slate-400",
            showError && error && "border-red-400 focus:border-red-500 focus:ring-red-500/30"
          )}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <LuChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        </button>

        {open ? (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {searchable ? (
              <div className="border-b border-slate-100 p-2">
                <div className={MODAL_SEARCH_CONTROL_CLASS}>
                  <LuSearch className="mr-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <input
                    type="search"
                    aria-label={searchPlaceholder}
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none"
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
                <li className="px-3 py-2 text-sm text-slate-500">Không tìm thấy kết quả</li>
              ) : (
                displayOptions.map((option) => (
                  <li key={option.id} role="option" aria-selected={option.id === value}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50",
                        option.id === value && "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => handleSelect(option.id)}
                    >
                      <span className="font-medium text-slate-900">{option.label}</span>
                      {option.sublabel ? (
                        <span className="text-xs text-slate-500">{option.sublabel}</span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {showError ? <ModalFieldError message={error} /> : null}
    </div>
  );
}
