import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";

import type { AccidentAttachment } from "../types";

type IncidentAttachmentsGalleryProps = {
  attachments: AccidentAttachment[];
};

export default function IncidentAttachmentsGallery({
  attachments,
}: IncidentAttachmentsGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const preview = previewIndex !== null ? attachments[previewIndex] : null;

  useEffect(() => {
    if (previewIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewIndex(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        setPreviewIndex((current) =>
          current === null ? null : (current - 1 + attachments.length) % attachments.length
        );
        return;
      }
      if (event.key === "ArrowRight") {
        setPreviewIndex((current) =>
          current === null ? null : (current + 1) % attachments.length
        );
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [previewIndex, attachments.length]);

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-slate-500">Không có ảnh — chỉ có khi tài xế báo cáo</p>
    );
  }

  return (
    <>
      <ul className="flex flex-wrap gap-1.5">
        {attachments.map((file, index) => (
          <li
            key={file.id}
            className="size-24 shrink-0 overflow-hidden rounded-md border border-slate-200"
          >
            <button
              type="button"
              className="group block size-full"
              onClick={() => setPreviewIndex(index)}
              aria-label={`Xem ảnh ${file.name}`}
              title={file.name}
            >
              <img
                src={file.url}
                alt={file.name}
                className="size-full object-cover transition-opacity group-hover:opacity-90"
              />
            </button>
          </li>
        ))}
      </ul>

      {preview ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Xem trước ${preview.name}`}
          onClick={() => setPreviewIndex(null)}
        >
          <button
            type="button"
            aria-label="Đóng"
            className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-colors hover:bg-white"
            onClick={() => setPreviewIndex(null)}
          >
            <LuX className="h-5 w-5" aria-hidden />
          </button>

          {attachments.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Ảnh trước"
                className="absolute left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-colors hover:bg-white sm:left-6"
                onClick={(event) => {
                  event.stopPropagation();
                  setPreviewIndex(
                    (previewIndex! - 1 + attachments.length) % attachments.length
                  );
                }}
              >
                <LuChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Ảnh sau"
                className="absolute right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-colors hover:bg-white sm:right-6"
                onClick={(event) => {
                  event.stopPropagation();
                  setPreviewIndex((previewIndex! + 1) % attachments.length);
                }}
              >
                <LuChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          ) : null}

          <div
            className="flex max-h-full max-w-5xl flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={preview.url}
              alt={preview.name}
              className="max-h-[min(80vh,720px)] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <p className="text-sm text-white/90">{preview.name}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
