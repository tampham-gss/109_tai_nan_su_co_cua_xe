import { Children, isValidElement } from "react";
import { LuArrowLeft, LuSquarePen } from "react-icons/lu";

import type {
  AccidentRecord,
  OverallStatus,
  ProcessingStatus,
  ReceptionStatus,
} from "../types";
import { AREA_LABEL_BY_CODE } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatCurrency } from "../utils/currencyUtils";
import { formatViDate, formatViDateTime } from "../utils/dateUtils";
import { severityBadgeClass } from "../utils/severityUtils";
import type { AccidentEditSection } from "./AccidentFormModal";
import AccidentSystemInfoCard from "./AccidentSystemInfoCard";
import IncidentAttachmentsGallery from "./IncidentAttachmentsGallery";
import { Tooltip } from "./Tooltip";
import { cn, OutlineButton, PageTitle } from "./ui";

type AccidentDetailViewProps = {
  record: AccidentRecord;
  onBack: () => void;
  onEdit: (section: AccidentEditSection) => void;
};

const DETAIL_COLUMN_COUNT = 3;

function formatDate(value: string): string {
  return value ? formatViDate(value) : "—";
}

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

function StatusBadge({
  value,
  className,
}: {
  value: string;
  className: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}>
      {value}
    </span>
  );
}

function splitIntoColumns<T>(items: T[], columnCount = DETAIL_COLUMN_COUNT): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  if (items.length === 0) return columns;

  const base = Math.floor(items.length / columnCount);
  const remainder = items.length % columnCount;
  let index = 0;

  for (let column = 0; column < columnCount; column += 1) {
    const size = base + (column < remainder ? 1 : 0);
    columns[column] = items.slice(index, index + size);
    index += size;
  }

  return columns;
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="break-words text-sm text-slate-900">{value || "—"}</dd>
    </div>
  );
}

function SectionEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Chỉnh sửa" placement="bottom">
      <button
        type="button"
        aria-label="Chỉnh sửa"
        onClick={onClick}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
      >
        <LuSquarePen className="h-4 w-4" aria-hidden />
      </button>
    </Tooltip>
  );
}

function DetailSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const items = Children.toArray(children).filter((child) => isValidElement(child));
  const columns = splitIntoColumns(items, DETAIL_COLUMN_COUNT);

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-slate-800">{title}</h3>
        {onEdit ? <SectionEditButton onClick={onEdit} /> : null}
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-4 p-4 md:grid-cols-3">
        {columns.map((columnItems, columnIndex) => (
          <dl key={columnIndex} className="flex min-w-0 flex-col gap-4">
            {columnItems}
          </dl>
        ))}
      </div>
    </section>
  );
}

export default function AccidentDetailView({ record, onBack, onEdit }: AccidentDetailViewProps) {
  const vehicle = getVehicleById(record.vehicleId);
  const plateNumber = vehicle?.plateNumber ?? "—";

  return (
    <>
      <div className="flex shrink-0 items-center gap-3">
        <OutlineButton onClick={onBack} className="shrink-0 px-2.5">
          <span className="inline-flex items-center gap-1.5">
            <LuArrowLeft className="h-4 w-4" aria-hidden />
            Quay lại
          </span>
        </OutlineButton>
        <PageTitle>Chi tiết tai nạn/sự cố</PageTitle>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:items-stretch">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto">
            <DetailSection title="Thông tin sự cố" onEdit={() => onEdit("incident")}>
              <DetailItem label="Số xe" value={<span className="font-medium">{plateNumber}</span>} />
              <DetailItem label="Tài xế" value={<span className="font-medium">{record.driverName}</span>} />
              <DetailItem label="Khu vực" value={AREA_LABEL_BY_CODE[record.area]} />
              <DetailItem label="Loại sự cố" value={record.incidentType} />
              <DetailItem
                label="Mức độ"
                value={
                  record.severity ? (
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        severityBadgeClass(record.severity)
                      )}
                    >
                      {record.severity}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailItem label="Địa điểm xảy ra tai nạn" value={record.incidentLocation} />
              <DetailItem
                label="Ngày xảy ra sự cố"
                value={<span className="tabular-nums">{formatDate(record.incidentDate)}</span>}
              />
              <DetailItem
                label="Thời điểm ghi nhận"
                value={<span className="tabular-nums">{formatViDateTime(record.recordedAt)}</span>}
              />
              <DetailItem
                label="Trạng thái tiếp nhận"
                value={
                  <StatusBadge
                    value={record.receptionStatus}
                    className={receptionBadgeClass(record.receptionStatus)}
                  />
                }
              />
              <DetailItem
                label="Trạng thái xử lý"
                value={
                  <StatusBadge
                    value={record.processingStatus}
                    className={processingBadgeClass(record.processingStatus)}
                  />
                }
              />
              <DetailItem
                label="Trạng thái tổng thể"
                value={
                  <StatusBadge
                    value={record.overallStatus}
                    className={overallBadgeClass(record.overallStatus)}
                  />
                }
              />
              <DetailItem label="Nguồn thông tin" value={record.informationSource} />
              <DetailItem label="Bộ phận ghi nhận" value={record.reportingDepartment} />
            </DetailSection>

            <DetailSection title="Nội dung & nguyên nhân" onEdit={() => onEdit("content")}>
              <DetailItem label="Đơn vị Bảo hiểm" value={record.insuranceCompany} />
              <DetailItem label="Giám định viên" value={record.assessor} />
              <DetailItem label="Nguyên nhân" value={record.cause} />
              <DetailItem label="Chi tiết" value={record.detailType} />
              <DetailItem label="Thời điểm" value={record.timeOfDay} />
              <DetailItem label="Diễn giải" value={record.description} />
            </DetailSection>

            <DetailSection title="Chi phí & thanh toán" onEdit={() => onEdit("payment")}>
              <DetailItem
                label="Ngày hoàn thành hồ sơ"
                value={<span className="tabular-nums">{formatDate(record.completionDate)}</span>}
              />
              <DetailItem
                label="Ngày thanh toán"
                value={<span className="tabular-nums">{formatDate(record.paymentDate)}</span>}
              />
              <DetailItem
                label="Tổn thất"
                value={<span className="tabular-nums">{formatCurrency(record.totalLoss)}</span>}
              />
              <DetailItem
                label="BH đền"
                value={<span className="tabular-nums">{formatCurrency(record.insurancePay)}</span>}
              />
              <DetailItem
                label="TX chịu"
                value={<span className="tabular-nums">{formatCurrency(record.driverPay)}</span>}
              />
              <DetailItem
                label="Cty chia sẻ"
                value={<span className="tabular-nums">{formatCurrency(record.companyShare)}</span>}
              />
              <DetailItem label="Hình thức bảo hiểm thanh toán" value={record.insurancePaymentMethod} />
              <DetailItem
                label="Số tiền còn lại phải thanh toán"
                value={
                  <span className="font-medium tabular-nums text-amber-700">
                    {formatCurrency(record.remainingPayment)}
                  </span>
                }
              />
            </DetailSection>

            <DetailSection title="Bảo hiểm & thông tin khác" onEdit={() => onEdit("other")}>
              <DetailItem label="TNDS" value={record.tnds} />
              <DetailItem label="Vật chất" value={record.materialDamage} />
              <DetailItem
                label="Số ngày xe dừng"
                value={<span className="tabular-nums">{record.vehicleStopDays}</span>}
              />
              <DetailItem label="Giải pháp xử lý" value={record.handlingSolution} />
              <DetailItem label="Ghi chú" value={record.notes} />
            </DetailSection>

            <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-2.5">
                <h3 className="text-sm font-semibold text-slate-800">Thông tin ghi nhận</h3>
              </div>
              <div className="space-y-4 p-4">
                <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                  <DetailItem label="Mã sự cố" value={<span className="font-medium">{record.code}</span>} />
                  <DetailItem label="Nguồn gửi" value={record.source} />
                  <DetailItem label="Người báo cáo" value={record.reporterFullName} />
                  <DetailItem label="SĐT người báo cáo" value={record.reporterPhone} />
                  <DetailItem label="Email người báo cáo" value={record.reporterEmail} />
                  <DetailItem label="Vai trò người báo cáo" value={record.reporterRoleName} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">Ảnh đính kèm</p>
                  <IncidentAttachmentsGallery attachments={record.attachments} />
                </div>
              </div>
            </section>
          </div>
        </section>

        <AccidentSystemInfoCard
          logs={record.activityLogs}
          className="h-[min(18rem,32vh)] w-full shrink-0 lg:h-auto lg:w-[min(300px,32%)] lg:max-w-[300px] lg:shrink-0"
        />
      </div>
    </>
  );
}
