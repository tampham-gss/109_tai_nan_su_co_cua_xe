export type AreaCode = "HCM" | "HAI_PHONG" | "CLO";

export type AccidentStatus = "Chưa xử lý" | "Theo dõi" | "Đã xử lý";

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

export type AccidentRecord = {
  id: string;
  status: AccidentStatus;
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
};

export type AccidentFilterState = {
  startDate: string;
  endDate: string;
  areaId: "all" | AreaCode;
  driverId: "all" | string;
  vehicleId: "all" | string;
  status: "all" | AccidentStatus;
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
