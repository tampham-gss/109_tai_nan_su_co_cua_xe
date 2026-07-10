import { LuX } from "react-icons/lu";

import { MODAL_HEADER_CLASS, MODAL_HEADING_CLASS } from "../../styles/modalStyles";

type ModalHeaderProps = {
  title: string;
  titleId?: string;
  onClose: () => void;
};

export default function ModalHeader({ title, titleId, onClose }: ModalHeaderProps) {
  return (
    <header className={MODAL_HEADER_CLASS}>
      <h2 id={titleId} className={MODAL_HEADING_CLASS}>
        {title}
      </h2>
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <LuX className="h-5 w-5" aria-hidden />
      </button>
    </header>
  );
}
