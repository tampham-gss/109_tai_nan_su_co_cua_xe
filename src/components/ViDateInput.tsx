import { useEffect, useState } from "react";

import { formatViDate, parseViDate } from "../utils/dateUtils";

type ViDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  onBlur?: () => void;
};

function clampIsoDate(isoDate: string, min?: string, max?: string): string {
  if (min && isoDate < min) return min;
  if (max && isoDate > max) return max;
  return isoDate;
}

export default function ViDateInput({
  value,
  onChange,
  min,
  max,
  id,
  className,
  placeholder = "dd/MM/yyyy",
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  onBlur,
}: ViDateInputProps) {
  const [text, setText] = useState(() => formatViDate(value));

  useEffect(() => {
    setText(formatViDate(value));
  }, [value]);

  const commit = () => {
    const parsed = parseViDate(text);
    if (!parsed) {
      setText(formatViDate(value));
      return;
    }

    const nextValue = clampIsoDate(parsed, min, max);
    onChange(nextValue);
    setText(formatViDate(nextValue));
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid}
      placeholder={placeholder}
      className={className}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        commit();
        onBlur?.();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        }
      }}
    />
  );
}
