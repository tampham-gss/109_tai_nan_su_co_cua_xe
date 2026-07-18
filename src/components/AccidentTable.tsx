import { useEffect, useMemo, useRef, useState } from "react";
import { LuPencil, LuSquarePen, LuTrash2 } from "react-icons/lu";

import type {
  AccidentRecord,
  OverallStatus,
  ProcessingStatus,
  ReceptionStatus,
} from "../types";
import { AREA_LABEL_BY_CODE } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatViDate } from "../utils/dateUtils";
import { severityBadgeClass } from "../utils/severityUtils";
import TablePager, { buildPaginationMeta, DEFAULT_PAGE_SIZE } from "./TablePager";
import { Tooltip } from "./Tooltip";
import AccidentDeleteModal from "./AccidentDeleteModal";
import { cn } from "./ui";

const headerClass =
  "whitespace-nowrap px-3 py-2 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase";

const headerCenterClass =
  "whitespace-nowrap px-3 py-2 text-center text-xs font-semibold tracking-wide text-slate-600 uppercase";

const bodyClass = "whitespace-nowrap px-3 py-2 text-slate-700";

const rowClass =
  "cursor-pointer border-b border-slate-100 hover:bg-slate-50/60";

export type AccidentStatusPatch = Partial<
  Pick<AccidentRecord, "receptionStatus" | "processingStatus" | "overallStatus">
>;

type AccidentTableProps = {
  records: AccidentRecord[];
  onViewDetail: (record: AccidentRecord) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, patch: AccidentStatusPatch) => void;
};

const RECEPTION_OPTIONS: ReceptionStatus[] = ["Chưa tiếp nhận", "Đã tiếp nhận"];
const PROCESSING_OPTIONS: ProcessingStatus[] = ["Chưa xử lý", "Đang xử lý", "Đã xử lý"];
const OVERALL_OPTIONS: OverallStatus[] = ["Đang theo dõi", "Đóng"];

function receptionBadgeClass(status: ReceptionStatus): string {
  return status === "Đã tiếp nhận"
    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
    : "border-amber-300 bg-amber-50 text-amber-700";
}

function processingBadgeClass(status: ProcessingStatus): string {
  if (status === "Đã xử lý") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Đang xử lý") return "border-blue-300 bg-blue-50 text-blue-700";
  return "border-amber-300 bg-amber-50 text-amber-700";
}

function overallBadgeClass(status: OverallStatus): string {
  return status === "Đóng"
    ? "border-slate-300 bg-slate-50 text-slate-700"
    : "border-blue-300 bg-blue-50 text-blue-700";
}

function IconEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Chi tiết" placement="bottom">
      <button
        type="button"
        aria-label="Chi tiết"
        onClick={onClick}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
      >
        <LuSquarePen className="h-4 w-4" aria-hidden />
      </button>
    </Tooltip>
  );
}

function IconDeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Xóa" placement="bottom">
      <button
        type="button"
        aria-label="Xóa"
        onClick={onClick}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
      >
        <LuTrash2 className="h-4 w-4" aria-hidden />
      </button>
    </Tooltip>
  );
}

function formatDateCell(value: string): string {
  return value ? formatViDate(value) : "—";
}

function StatusSelectCell<T extends string>({
  value,
  options,
  badgeClassName,
  menuId,
  openMenuId,
  onOpenMenu,
  onSelect,
  ariaLabel,
}: {
  value: T;
  options: T[];
  badgeClassName: string;
  menuId: string;
  openMenuId: string | null;
  onOpenMenu: (id: string | null) => void;
  onSelect: (next: T) => void;
  ariaLabel: string;
}) {
  const open = openMenuId === menuId;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }

    const updatePos = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    };

    updatePos();

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenMenu(null);
      }
    };

    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open, onOpenMenu]);

  return (
    <div
      ref={rootRef}
      className="relative inline-flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <span
        className={cn(
          "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
          badgeClassName
        )}
      >
        {value}
      </span>
      <Tooltip label={ariaLabel} placement="bottom">
        <button
          ref={buttonRef}
          type="button"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => onOpenMenu(open ? null : menuId)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-blue-600 transition-colors hover:bg-blue-50"
        >
          <LuPencil className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </Tooltip>
      {open && menuPos ? (
        <ul
          role="listbox"
          className="fixed z-50 min-w-[10.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {options.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                className={cn(
                  "flex w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50",
                  option === value && "bg-blue-50 font-medium text-blue-700"
                )}
                onClick={() => {
                  onSelect(option);
                  onOpenMenu(null);
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function AccidentTable({
  records,
  onViewDetail,
  onDelete,
  onStatusChange,
}: AccidentTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  const pagination = useMemo(
    () => buildPaginationMeta(page, pageSize, records.length),
    [page, pageSize, records.length]
  );

  const totalPages = pagination.totalPages;

  useEffect(() => {
    setPage(1);
  }, [records, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, page, pageSize]);

  const pendingDeleteRecord = useMemo(
    () => records.find((record) => record.id === pendingDeleteId) ?? null,
    [records, pendingDeleteId]
  );

  if (records.length === 0) {
    return (
      <section className="flex h-full min-h-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="p-8 text-center text-sm text-gray-500">
          Không có dữ liệu tai nạn/sự cố phù hợp bộ lọc.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
          <table className="min-w-[1100px] w-full border-collapse text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className={headerClass}>Mã</th>
                <th className={headerClass}>Loại sự cố</th>
                <th className={headerClass}>Mức độ</th>
                <th className={headerClass}>Số xe</th>
                <th className={headerClass}>Tài xế</th>
                <th className={headerClass}>Khu vực</th>
                <th className={headerClass}>Nguồn</th>
                <th className={headerClass}>Địa điểm</th>
                <th className={headerClass}>Ngày xảy ra</th>
                <th className={headerClass}>Diễn giải</th>
                <th className={headerClass}>Tiếp nhận</th>
                <th className={headerClass}>Xử lý</th>
                <th className={headerClass}>Tổng thể</th>
                <th className={headerCenterClass}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => {
                const vehicle = getVehicleById(row.vehicleId);

                return (
                  <tr
                    key={row.id}
                    className={rowClass}
                    onClick={() => onViewDetail(row)}
                  >
                    <td className={cn(bodyClass, "font-medium text-gray-900")}>{row.code}</td>
                    <td className={bodyClass}>{row.incidentType || "—"}</td>
                    <td className={bodyClass}>
                      {row.severity ? (
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                            severityBadgeClass(row.severity)
                          )}
                        >
                          {row.severity}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={cn(bodyClass, "font-medium text-gray-900")}>
                      {vehicle?.plateNumber ?? "—"}
                    </td>
                    <td className={cn(bodyClass, "font-medium text-gray-900")}>{row.driverName}</td>
                    <td className={bodyClass}>{AREA_LABEL_BY_CODE[row.area]}</td>
                    <td className={bodyClass}>{row.source || "—"}</td>
                    <td className={cn(bodyClass, "max-w-[14rem] truncate")} title={row.incidentLocation}>
                      {row.incidentLocation || "—"}
                    </td>
                    <td className={cn(bodyClass, "tabular-nums")}>{formatDateCell(row.incidentDate)}</td>
                    <td className={cn(bodyClass, "max-w-[16rem] truncate")} title={row.description}>
                      {row.description || "—"}
                    </td>
                    <td className={bodyClass}>
                      <StatusSelectCell
                        value={row.receptionStatus}
                        options={RECEPTION_OPTIONS}
                        badgeClassName={receptionBadgeClass(row.receptionStatus)}
                        menuId={`${row.id}-reception`}
                        openMenuId={openStatusMenuId}
                        onOpenMenu={setOpenStatusMenuId}
                        ariaLabel="Đổi trạng thái tiếp nhận"
                        onSelect={(receptionStatus) =>
                          onStatusChange(row.id, { receptionStatus })
                        }
                      />
                    </td>
                    <td className={bodyClass}>
                      <StatusSelectCell
                        value={row.processingStatus}
                        options={PROCESSING_OPTIONS}
                        badgeClassName={processingBadgeClass(row.processingStatus)}
                        menuId={`${row.id}-processing`}
                        openMenuId={openStatusMenuId}
                        onOpenMenu={setOpenStatusMenuId}
                        ariaLabel="Đổi trạng thái xử lý"
                        onSelect={(processingStatus) =>
                          onStatusChange(row.id, { processingStatus })
                        }
                      />
                    </td>
                    <td className={bodyClass}>
                      <StatusSelectCell
                        value={row.overallStatus}
                        options={OVERALL_OPTIONS}
                        badgeClassName={overallBadgeClass(row.overallStatus)}
                        menuId={`${row.id}-overall`}
                        openMenuId={openStatusMenuId}
                        onOpenMenu={setOpenStatusMenuId}
                        ariaLabel="Đổi trạng thái tổng thể"
                        onSelect={(overallStatus) => onStatusChange(row.id, { overallStatus })}
                      />
                    </td>
                    <td
                      className={cn(bodyClass, "text-center")}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <IconEditButton onClick={() => onViewDetail(row)} />
                        <IconDeleteButton onClick={() => setPendingDeleteId(row.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TablePager
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="shrink-0 px-4 py-3 sm:px-5"
          ariaLabel="Phân trang danh sách tai nạn sự cố"
        />
      </section>

      <AccidentDeleteModal
        open={pendingDeleteId !== null}
        record={pendingDeleteRecord}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}
