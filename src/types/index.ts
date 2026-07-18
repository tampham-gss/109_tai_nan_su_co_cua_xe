export type AreaCode = "HCM" | "HAI_PHONG" | "CLO";

export type ReceptionStatus = "Chưa tiếp nhận" | "Đã tiếp nhận";

export type ProcessingStatus = "Chưa xử lý" | "Đang xử lý" | "Đã xử lý";

export type OverallStatus = "Đang theo dõi" | "Đóng";

export type DetailType = "Chủ quan" | "Khách quan";

export type TimeOfDay = "Ngày" | "Đêm";

export type YesNo = "Có" | "Không";

export type Driver = {
  id: string;
  name: string;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  area: AreaCode;
  areaLabel: string;
};

export type AccidentActivityAction = "CREATED" | "UPDATED";

export type AccidentActivityChange = {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
};

export type AccidentActivityLog = {
  id: string;
  createdAt: string;
  actorName: string;
  action: AccidentActivityAction;
  changes: AccidentActivityChange[];
};

export type AccidentAttachment = {
  id: string;
  name: string;
  url: string;
};

export type AccidentRecord = {
  id: string;
  code: string;
  incidentType: string;
  receptionStatus: ReceptionStatus;
  processingStatus: ProcessingStatus;
  overallStatus: OverallStatus;
  recordedAt: string;
  source: string;
  reporterFullName: string;
  reporterEmail: string;
  reporterPhone: string;
  reporterRoleName: string;
  severity: string;
  informationSource: string;
  reportingDepartment: string;
  handlingSolution: string;
  attachments: AccidentAttachment[];
  area: AreaCode;
  vehicleId: string;
  driverName: string;
  incidentLocation: string;
  incidentDate: string;
  insuranceCompany: string;
  assessor: string;
  description: string;
  cause: string;
  detailType: DetailType;
  timeOfDay: TimeOfDay;
  completionDate: string;
  totalLoss: number;
  insurancePay: number;
  driverPay: number;
  companyShare: number;
  insurancePaymentMethod: string;
  paymentDate: string;
  remainingPayment: number;
  tnds: YesNo;
  materialDamage: YesNo;
  vehicleStopDays: number;
  notes: string;
  activityLogs: AccidentActivityLog[];
};

export type AccidentFilterState = {
  startDate: string;
  endDate: string;
  areaId: "all" | AreaCode;
  driverId: "all" | string;
  vehicleId: "all" | string;
  receptionStatus: "all" | ReceptionStatus;
  processingStatus: "all" | ProcessingStatus;
  overallStatus: "all" | OverallStatus;
  incidentType: "all" | string;
  severity: "all" | string;
};

export const AREA_OPTIONS: { id: AccidentFilterState["areaId"]; label: string }[] = [
  { id: "all", label: "Tất cả khu vực" },
  { id: "CLO", label: "Cửa Lò" },
  { id: "HAI_PHONG", label: "Hải Phòng" },
  { id: "HCM", label: "Hồ Chí Minh" },
];

export const AREA_LABEL_BY_CODE: Record<AreaCode, string> = {
  CLO: "Cửa Lò",
  HAI_PHONG: "Hải Phòng",
  HCM: "Hồ Chí Minh",
};

export const DEFAULT_INSURANCE_COMPANIES = [
  "Bảo Việt",
  "PVI",
  "Bảo Minh",
  "PTI",
  "MIC",
  "VBI",
];

export const DEFAULT_ASSESSORS = [
  "Nguyễn Văn Giám định",
  "Trần Minh Thẩm định",
  "Lê Hoàng Định giá",
];

export const DEFAULT_INSURANCE_PAYMENT_METHODS = [
  "BH thanh toán về công ty",
  "Bảo hiểm thanh toán cho gara",
];

export const DEFAULT_CAUSES = [
  "Sử dụng điện thoại",
  "Xe đi ngược chiều không làm chủ tốc độ",
  "Thiếu quan sát",
  "Mặt đường khu vực kho không bằng phẳng",
];

export const DEFAULT_INCIDENT_TYPES = [
  "Sự cố Bất thường/Hư hỏng xe",
  "Sự cố An toàn / Vận hành",
];

export const DEFAULT_SEVERITIES = ["Thấp", "Trung bình", "Cao", "Nghiêm trọng"];

export const DEFAULT_INFORMATION_SOURCES = [
  "Camera",
  "Báo cáo tài xế",
  "Hotline",
  "Khách hàng",
];

export const DEFAULT_REPORTING_DEPARTMENTS = ["An toàn", "Điều vận", "Kỹ thuật"];
