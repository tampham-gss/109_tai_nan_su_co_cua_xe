import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import ModalFieldError from "./modal/ModalFieldError";
import ModalFieldLabel from "./modal/ModalFieldLabel";
import { cn } from "./ui";
import {
  MODAL_FIELD_ROOT_CLASS,
  MODAL_NATIVE_INPUT_INNER_CLASS,
  MODAL_SEARCH_CONTROL_CLASS,
  MODAL_SELECT_TRIGGER_CLASS,
} from "../styles/modalStyles";

const CUSTOM_OPTION_ID = "__custom__";
const CUSTOM_OPTION_LABEL = "Nhập mới";

type CreatableLookupFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onOptionsChange: (options: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showError?: boolean;
  className?: string;
};

/** Lookup có thể chọn hoặc nhập mới — tham khảo fleet CreatableLookupField. */
export default function CreatableLookupField({
  label,
  value,
  options,
  onChange,
  onOptionsChange,
  onBlur,
  placeholder,
  required,
  error,
  showError,
  className,
}: CreatableLookupFieldProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [customEntry, setCustomEntry] = useState(false);

  const isCustomValue = value !== "" && !options.includes(value);
  const showCustomInput = customEntry || isCustomValue;

  const displayOptions = useMemo(() => [...options], [options]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onBlur, open]);

  useEffect(() => {
    if (isCustomValue) setCustomEntry(true);
  }, [isCustomValue]);

  const handleSelect = (next: string) => {
    if (next === CUSTOM_OPTION_ID) {
      setCustomEntry(true);
      onChange("");
      setOpen(false);
      return;
    }
    setCustomEntry(false);
    onChange(next);
    setOpen(false);
    onBlur?.();
  };

  const handleCustomTextChange = (text: string) => {
    const matched = options.find((option) => option.toLowerCase() === text.trim().toLowerCase());
    if (matched) {
      setCustomEntry(false);
      onChange(matched);
      return;
    }

    onChange(text);
    const trimmed = text.trim();
    if (trimmed && !options.includes(trimmed)) {
      onOptionsChange([...options, trimmed]);
    }
  };

  const triggerLabel = showCustomInput ? CUSTOM_OPTION_LABEL : value || placeholder || "Chọn...";

  const inputPlaceholder =
    placeholder?.startsWith("Chọn ")
      ? `Nhập ${placeholder.slice(5)}`
      : placeholder ?? label;

  return (
    <div className={cn(MODAL_FIELD_ROOT_CLASS, className)}>
      <ModalFieldLabel required={required}>{label}</ModalFieldLabel>
      <div ref={rootRef} className="space-y-2">
        <div className="relative w-full">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-invalid={showError && !!error}
            className={cn(
              MODAL_SELECT_TRIGGER_CLASS,
              !value && !showCustomInput && "text-slate-400",
              showError && error && "border-red-400 focus:border-red-500 focus:ring-red-500/30"
            )}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="truncate">{triggerLabel}</span>
            <LuChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          </button>

          {open ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              {displayOptions.map((option) => (
                <li key={option} role="option" aria-selected={option === value && !showCustomInput}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
                      option === value && !showCustomInput && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </button>
                </li>
              ))}
              <li role="option" aria-selected={showCustomInput}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-slate-50",
                    showCustomInput && "bg-blue-50"
                  )}
                  onClick={() => handleSelect(CUSTOM_OPTION_ID)}
                >
                  {CUSTOM_OPTION_LABEL}
                </button>
              </li>
            </ul>
          ) : null}
        </div>

        {showCustomInput ? (
          <div className={MODAL_SEARCH_CONTROL_CLASS}>
            <input
              type="text"
              aria-label={label}
              className={MODAL_NATIVE_INPUT_INNER_CLASS}
              value={value}
              placeholder={inputPlaceholder ?? label}
              onChange={(event) => handleCustomTextChange(event.target.value)}
              onBlur={onBlur}
            />
          </div>
        ) : null}
      </div>
      {showError ? <ModalFieldError message={error} /> : null}
    </div>
  );
}
