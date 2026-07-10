import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LuSave } from "react-icons/lu";

import { MODAL_BTN_CANCEL_CLASS, MODAL_BTN_DANGER_CLASS, MODAL_BTN_PRIMARY_CLASS } from "../../styles/modalStyles";
import { cn } from "../ui";

type ModalButtonVariant = "cancel" | "primary" | "danger";

type ModalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ModalButtonVariant;
  children: ReactNode;
  showIcon?: boolean;
};

const VARIANT_CLASS: Record<ModalButtonVariant, string> = {
  cancel: MODAL_BTN_CANCEL_CLASS,
  primary: MODAL_BTN_PRIMARY_CLASS,
  danger: MODAL_BTN_DANGER_CLASS,
};

export default function ModalButton({
  variant,
  children,
  showIcon = true,
  className,
  type = "button",
  ...props
}: ModalButtonProps) {
  return (
    <button type={type} className={cn(VARIANT_CLASS[variant], className)} {...props}>
      {showIcon && variant === "primary" ? <LuSave className="h-4 w-4 shrink-0" aria-hidden /> : null}
      {children}
    </button>
  );
}
