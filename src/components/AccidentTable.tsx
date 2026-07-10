import { useEffect, useMemo, useState } from "react";
import { LuSquarePen, LuTrash2 } from "react-icons/lu";

import type { AccidentRecord } from "../types";
import { AREA_LABEL_BY_CODE, computeRemainingPayment } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatCurrency } from "../utils/currencyUtils";
import { formatViDate } from "../utils/dateUtils";
import TablePager, { buildPaginationMeta, DEFAULT_PAGE_SIZE } from "./TablePager";
import { Tooltip } from "./Tooltip";
import AccidentDeleteModal from "./AccidentDeleteModal";
import { cn } from "./ui";

const headerClass =
  "whitespace-nowrap px-3 py-2 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase";

const headerCenterClass =
  "whitespace-nowrap px-3 py-2 text-center text-xs font-semibold tracking-wide text-slate-600 uppercase";

const bodyClass = "whitespace-nowrap px-3 py-2 text-slate-700";

const rowClass = "h-10 border-b border-slate-100 hover:bg-slate-50/60";

type AccidentTableProps = {
  records: AccidentRecord[];
  onEdit: (record: AccidentRecord) => void;
  onDelete: (id: string) => void;
};

function statusBadgeClass(status: AccidentRecord["status"]): string {
  if (status === "Đã xử lý") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Theo dõi") return "border-blue-300 bg-blue-50 text-blue-700";
  return "border-amber-300 bg-amber-50 text-amber-700";
}

function yesNoBadgeClass(value: AccidentRecord["tnds"]): string {
  return value === "Có"
    ? "border-slate-300 bg-slate-50 text-slate-700"
    : "border-slate-200 bg-white text-slate-500";
}

function IconEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Sửa" placement="bottom">
      <button
        type="button"
        aria-label="Sửa"
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

export default function AccidentTable({ records, onEdit, onDelete }: AccidentTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="p-8 text-center text-sm text-gray-500">
          Không có dữ liệu tai nạn/sự cố phù hợp bộ lọc.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[2400px] w-full border-collapse text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className={headerClass}>Trạng thái</th>
                <th className={headerClass}>Khu vực</th>
                <th className={headerClass}>Số xe</th>
                <th className={headerClass}>Tài xế</th>
                <th className={headerClass}>Địa điểm xảy ra tai nạn</th>
                <th className={headerClass}>Ngày xảy ra sự cố</th>
                <th className={headerClass}>Đơn vị Bảo hiểm</th>
                <th className={headerClass}>Giám định viên</th>
                <th className={headerClass}>Diễn giải</th>
                <th className={headerClass}>Nguyên nhân</th>
                <th className={headerClass}>Chi tiết</th>
                <th className={headerClass}>Thời điểm</th>
                <th className={headerClass}>Ngày hoàn thành hồ sơ</th>
                <th className={cn(headerClass, "text-right")}>Tổn thất</th>
                <th className={cn(headerClass, "text-right")}>BH đền</th>
                <th className={cn(headerClass, "text-right")}>TX chịu</th>
                <th className={cn(headerClass, "text-right")}>Cty chia sẻ</th>
                <th className={headerClass}>Ngày thanh toán</th>
                <th className={cn(headerClass, "text-right")}>Còn lại phải thanh toán</th>
                <th className={headerClass}>TNDS</th>
                <th className={headerClass}>Vật chất</th>
                <th className={cn(headerClass, "text-right")}>Số ngày xe dừng</th>
                <th className={headerClass}>Ghi chú</th>
                <th className={cn(headerCenterClass, "sticky right-0 z-10 bg-gray-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]")}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => {
                const vehicle = getVehicleById(row.vehicleId);
                const remaining = computeRemainingPayment(row);

                return (
                  <tr key={row.id} className={rowClass}>
                    <td className={bodyClass}>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          statusBadgeClass(row.status)
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={bodyClass}>{AREA_LABEL_BY_CODE[row.area]}</td>
                    <td className={cn(bodyClass, "font-medium text-gray-900")}>
                      {vehicle?.plateNumber ?? "—"}
                    </td>
                    <td className={cn(bodyClass, "font-medium text-gray-900")}>{row.driverName}</td>
                    <td className={cn(bodyClass, "max-w-[12rem] truncate")} title={row.incidentLocation}>
                      {row.incidentLocation || "—"}
                    </td>
                    <td className={cn(bodyClass, "tabular-nums")}>{formatDateCell(row.incidentDate)}</td>
                    <td className={bodyClass}>{row.insuranceCompany || "—"}</td>
                    <td className={bodyClass}>{row.assessor || "—"}</td>
                    <td className={cn(bodyClass, "max-w-[14rem] truncate")} title={row.description}>
                      {row.description || "—"}
                    </td>
                    <td className={cn(bodyClass, "max-w-[12rem] truncate")} title={row.cause}>
                      {row.cause || "—"}
                    </td>
                    <td className={bodyClass}>{row.detailType}</td>
                    <td className={bodyClass}>{row.timeOfDay}</td>
                    <td className={cn(bodyClass, "tabular-nums")}>{formatDateCell(row.completionDate)}</td>
                    <td className={cn(bodyClass, "text-right tabular-nums")}>{formatCurrency(row.totalLoss)}</td>
                    <td className={cn(bodyClass, "text-right tabular-nums")}>{formatCurrency(row.insurancePay)}</td>
                    <td className={cn(bodyClass, "text-right tabular-nums")}>{formatCurrency(row.driverPay)}</td>
                    <td className={cn(bodyClass, "text-right tabular-nums")}>{formatCurrency(row.companyShare)}</td>
                    <td className={cn(bodyClass, "tabular-nums")}>{formatDateCell(row.paymentDate)}</td>
                    <td className={cn(bodyClass, "text-right tabular-nums font-medium text-amber-700")}>
                      {formatCurrency(remaining)}
                    </td>
                    <td className={bodyClass}>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                          yesNoBadgeClass(row.tnds)
                        )}
                      >
                        {row.tnds}
                      </span>
                    </td>
                    <td className={bodyClass}>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                          yesNoBadgeClass(row.materialDamage)
                        )}
                      >
                        {row.materialDamage}
                      </span>
                    </td>
                    <td className={cn(bodyClass, "text-right tabular-nums")}>{row.vehicleStopDays}</td>
                    <td className={cn(bodyClass, "max-w-[10rem] truncate")} title={row.notes}>
                      {row.notes || "—"}
                    </td>
                    <td
                      className={cn(
                        bodyClass,
                        "sticky right-0 z-10 bg-white text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]"
                      )}
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <IconEditButton onClick={() => onEdit(row)} />
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
          className="px-4 py-3 sm:px-5"
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
