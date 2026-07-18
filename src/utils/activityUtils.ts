import type {
  AccidentActivityChange,
  AccidentActivityLog,
  AccidentRecord,
  AreaCode,
} from "../types";
import { AREA_LABEL_BY_CODE } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatCurrency } from "./currencyUtils";
import { formatViDate } from "./dateUtils";

export type AccidentComparableValues = Omit<
  AccidentRecord,
  | "id"
  | "activityLogs"
  | "attachments"
  | "reporterFullName"
  | "reporterEmail"
  | "reporterPhone"
  | "reporterRoleName"
>;

const ACTIVITY_VISIBLE_FIELD_LIMIT = 2;

export const ACCIDENT_FIELD_LABELS: Record<keyof AccidentComparableValues, string> = {
  code: "Mã sự cố",
  incidentType: "Loại sự cố",
  receptionStatus: "Trạng thái tiếp nhận",
  processingStatus: "Trạng thái xử lý",
  overallStatus: "Trạng thái tổng thể",
  recordedAt: "Thời điểm ghi nhận",
  source: "Nguồn gửi",
  severity: "Mức độ",
  informationSource: "Nguồn thông tin",
  reportingDepartment: "Bộ phận ghi nhận",
  handlingSolution: "Giải pháp xử lý",
  area: "Khu vực",
  vehicleId: "Số xe",
  driverName: "Tài xế",
  incidentLocation: "Địa điểm xảy ra tai nạn",
  incidentDate: "Ngày xảy ra sự cố",
  insuranceCompany: "Đơn vị Bảo hiểm",
  assessor: "Giám định viên",
  description: "Diễn giải",
  cause: "Nguyên nhân",
  detailType: "Chi tiết",
  timeOfDay: "Thời điểm",
  completionDate: "Ngày hoàn thành hồ sơ",
  totalLoss: "Tổn thất",
  insurancePay: "BH đền",
  driverPay: "TX chịu",
  companyShare: "Cty chia sẻ",
  insurancePaymentMethod: "Hình thức bảo hiểm thanh toán",
  paymentDate: "Ngày thanh toán",
  remainingPayment: "Số tiền còn lại phải thanh toán",
  tnds: "TNDS",
  materialDamage: "Vật chất",
  vehicleStopDays: "Số ngày xe dừng",
  notes: "Ghi chú",
};

const FIELD_ORDER = Object.keys(ACCIDENT_FIELD_LABELS) as Array<keyof AccidentComparableValues>;

export function formatActivityFieldValue(
  field: keyof AccidentComparableValues,
  value: AccidentComparableValues[keyof AccidentComparableValues]
): string {
  if (value === null || value === undefined || value === "") return "—";

  if (field === "vehicleId") {
    return getVehicleById(String(value))?.plateNumber ?? String(value);
  }

  if (field === "area") {
    return AREA_LABEL_BY_CODE[value as AreaCode] ?? String(value);
  }

  if (field === "incidentDate" || field === "completionDate" || field === "paymentDate") {
    return formatViDate(String(value)) || "—";
  }

  if (field === "recordedAt") {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("vi-VN");
  }

  if (
    field === "totalLoss" ||
    field === "insurancePay" ||
    field === "driverPay" ||
    field === "companyShare" ||
    field === "remainingPayment"
  ) {
    return formatCurrency(Number(value));
  }

  return String(value);
}

export function buildActivityChanges(
  previous: AccidentComparableValues,
  next: AccidentComparableValues
): AccidentActivityChange[] {
  const changes: AccidentActivityChange[] = [];

  for (const field of FIELD_ORDER) {
    const oldRaw = previous[field];
    const newRaw = next[field];
    if (oldRaw === newRaw) continue;

    changes.push({
      field,
      fieldLabel: ACCIDENT_FIELD_LABELS[field],
      oldValue: formatActivityFieldValue(field, oldRaw),
      newValue: formatActivityFieldValue(field, newRaw),
    });
  }

  return changes;
}

export function toComparableFormValues(record: AccidentRecord): AccidentComparableValues {
  const {
    id: _id,
    activityLogs: _logs,
    attachments: _attachments,
    reporterFullName: _reporterFullName,
    reporterEmail: _reporterEmail,
    reporterPhone: _reporterPhone,
    reporterRoleName: _reporterRoleName,
    ...values
  } = record;
  return values;
}

export function createActivityLogEntry(
  action: AccidentActivityLog["action"],
  actorName: string,
  changes: AccidentActivityChange[] = []
): AccidentActivityLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    actorName,
    action,
    changes,
  };
}

export { ACTIVITY_VISIBLE_FIELD_LIMIT };
