import type { ReactNode } from "react";

type ModalFieldLabelProps = {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
};

export default function ModalFieldLabel({ children, required, htmlFor }: ModalFieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="text-xs text-slate-600">
      {children}
      {required ? <span className="text-red-600"> *</span> : null}
    </label>
  );
}
