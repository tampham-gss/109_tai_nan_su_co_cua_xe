import { LuArrowLeft, LuSquarePen } from "react-icons/lu";

import type { AccidentRecord } from "../types";
import { AREA_LABEL_BY_CODE } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatCurrency } from "../utils/currencyUtils";
import { formatViDate } from "../utils/dateUtils";
import { cn, OutlineButton, PageTitle, PrimaryButton } from "./ui";

type AccidentDetailViewProps = {
  record: AccidentRecord;
  onBack: () => void;
  onEdit: () => void;
};

function formatDate(value: string): string {
  return value ? formatViDate(value) : "—";
}

function statusBadgeClass(status: AccidentRecord["status"]): string {
  if (status === "Đã xử lý") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Theo dõi") return "border-blue-300 bg-blue-50 text-blue-700";
  return "border-amber-300 bg-amber-50 text-amber-700";
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

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/40">
      <h3 className="border-b border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800">
        {title}
      </h3>
      <dl className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
    </section>
  );
}

export default function AccidentDetailView({ record, onBack, onEdit }: AccidentDetailViewProps) {
  const vehicle = getVehicleById(record.vehicleId);
  const plateNumber = vehicle?.plateNumber ?? "—";

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <OutlineButton onClick={onBack} className="shrink-0 px-2.5">
            <span className="inline-flex items-center gap-1.5">
              <LuArrowLeft className="h-4 w-4" aria-hidden />
              Quay lại
            </span>
          </OutlineButton>
          <PageTitle>Chi tiết tai nạn/sự cố</PageTitle>
        </div>

        <PrimaryButton onClick={onEdit}>
          <span className="inline-flex items-center gap-1.5">
            <LuSquarePen className="h-4 w-4" aria-hidden />
            Chỉnh sửa
          </span>
        </PrimaryButton>
      </div>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <DetailSection title="Thông tin sự cố">
            <DetailItem label="Số xe" value={<span className="font-medium">{plateNumber}</span>} />
            <DetailItem label="Tài xế" value={<span className="font-medium">{record.driverName}</span>} />
            <DetailItem label="Khu vực" value={AREA_LABEL_BY_CODE[record.area]} />
            <DetailItem
              label="Địa điểm xảy ra tai nạn"
              value={record.incidentLocation}
              className="sm:col-span-2"
            />
            <DetailItem
              label="Ngày xảy ra sự cố"
              value={<span className="tabular-nums">{formatDate(record.incidentDate)}</span>}
            />
            <DetailItem
              label="Trạng thái"
              value={
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    statusBadgeClass(record.status)
                  )}
                >
                  {record.status}
                </span>
              }
            />
          </DetailSection>

          <DetailSection title="Nội dung & nguyên nhân">
            <DetailItem label="Đơn vị Bảo hiểm" value={record.insuranceCompany} />
            <DetailItem label="Giám định viên" value={record.assessor} />
            <DetailItem label="Nguyên nhân" value={record.cause} />
            <DetailItem label="Chi tiết" value={record.detailType} />
            <DetailItem label="Thời điểm" value={record.timeOfDay} />
            <DetailItem
              label="Diễn giải"
              value={record.description}
              className="sm:col-span-2 lg:col-span-3"
            />
          </DetailSection>

          <DetailSection title="Chi phí & thanh toán">
            <DetailItem
              label="Ngày hoàn thành hồ sơ"
              value={<span className="tabular-nums">{formatDate(record.completionDate)}</span>}
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
              label="Ngày thanh toán"
              value={<span className="tabular-nums">{formatDate(record.paymentDate)}</span>}
            />
            <DetailItem
              label="Số tiền còn lại phải thanh toán"
              value={
                <span className="font-medium tabular-nums text-amber-700">
                  {formatCurrency(record.remainingPayment)}
                </span>
              }
            />
          </DetailSection>

          <DetailSection title="Bảo hiểm & thông tin khác">
            <DetailItem label="TNDS" value={record.tnds} />
            <DetailItem label="Vật chất" value={record.materialDamage} />
            <DetailItem
              label="Số ngày xe dừng"
              value={<span className="tabular-nums">{record.vehicleStopDays}</span>}
            />
            <DetailItem label="Ghi chú" value={record.notes} className="sm:col-span-2 lg:col-span-3" />
          </DetailSection>
        </div>
      </section>
    </>
  );
}
