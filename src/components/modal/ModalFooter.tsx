import type { ReactNode } from "react";

import { MODAL_FOOTER_CLASS } from "../../styles/modalStyles";
import { cn } from "../ui";

type ModalFooterProps = {
  children: ReactNode;
  formError?: string | null;
  className?: string;
};

export default function ModalFooter({ children, formError, className }: ModalFooterProps) {
  return (
    <footer className={cn(MODAL_FOOTER_CLASS, formError && "justify-between", className)}>
      {formError ? (
        <p className="min-w-0 flex-1 text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="flex shrink-0 gap-2">{children}</div>
    </footer>
  );
}
