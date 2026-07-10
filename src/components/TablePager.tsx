import { useCallback, useMemo } from "react";
import { LuChevronLeft, LuChevronRight, LuChevronsUpDown } from "react-icons/lu";

import { cn } from "./ui";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [10, 20, 50] as const;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

type TablePagerProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizes?: readonly number[];
  className?: string;
  ariaLabel?: string;
};

export function buildPageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}

export function buildPaginationMeta(page: number, pageSize: number, totalCount: number): PaginationMeta {
  return {
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

export default function TablePager({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizes = PAGE_SIZES,
  className,
  ariaLabel = "Phân trang danh sách",
}: TablePagerProps) {
  const { page, pageSize, totalCount, totalPages } = pagination;

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);
  const pageItems = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

  const handlePageSizeChange = useCallback(
    (value: string) => {
      const next = Number(value);
      if (pageSizes.includes(next)) onPageSizeChange(next);
    },
    [onPageSizeChange, pageSizes]
  );

  const handlePrevious = useCallback(() => {
    if (page > 1) onPageChange(page - 1);
  }, [onPageChange, page]);

  const handleNext = useCallback(() => {
    if (page < totalPages) onPageChange(page + 1);
  }, [onPageChange, page, totalPages]);

  if (totalCount === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-slate-200/80 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
      aria-label={ariaLabel}
    >
      <p className="text-sm text-slate-600">
        Hiển thị <span className="font-semibold text-slate-800">{rangeStart}</span>
        {" - "}
        <span className="font-semibold text-slate-800">{rangeEnd}</span>
        {" trên tổng số "}
        <span className="font-semibold text-slate-800">{totalCount}</span>
        {" kết quả"}
      </p>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="relative">
          <select
            aria-label="Số dòng mỗi trang"
            className="h-9 w-16 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            value={pageSize}
            onChange={(event) => handlePageSizeChange(event.target.value)}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <LuChevronsUpDown
            className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
        </div>

        <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={page <= 1}
            onClick={handlePrevious}
            className="flex h-9 w-9 items-center justify-center rounded-l-lg border-r border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LuChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center border-r border-slate-200 text-sm text-slate-500"
                aria-hidden
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Trang ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center border-r border-slate-200 px-2 text-sm font-medium transition-colors last:border-r-0",
                  item === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            aria-label="Trang sau"
            disabled={page >= totalPages}
            onClick={handleNext}
            className="flex h-9 w-9 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LuChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
