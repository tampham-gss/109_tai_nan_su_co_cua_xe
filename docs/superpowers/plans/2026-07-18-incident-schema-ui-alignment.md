# Incident Schema UI Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Căn chỉnh giao diện prototype (types, mock, form, chi tiết, list, filter, labels) với schema `Incident` — chỉ UI + mock, không logic nghiệp vụ mới.

**Architecture:** Giữ pattern hiện có (4 section form, CreatableLookup, filter client-side, activity labels). Thay `status` bằng 3 enum UI. Thêm field schema vào types/mock/UI. Card chỉ đọc “Thông tin ghi nhận” + gallery ảnh. System fields (`code`, `source`, `recordedAt`, reporter*, `attachments`) nằm trên record và `createEmpty`/`toFormValues` nhưng **không render** trên form Web.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind 4, react-icons (prototype hiện tại). Không thêm dependency. Verify bằng `npm run build` (không có test runner).

**Spec:** `docs/superpowers/specs/2026-07-18-incident-schema-ui-alignment-design.md`

## Global Constraints

- Chỉ UI + mock + glue state tối thiểu giống pattern hiện có — **không** validate rule mới, không sinh mã sequence, không upload, không API.
- Giữ tên field cũ: `tnds`, `materialDamage`, `insurancePaymentMethod` (bỏ qua rename khuyến nghị trong spec để giảm churn).
- Mã hiển thị format `TN-YYYYMMDD-xxx` (hardcode trong mock / `createEmpty`).
- Ảnh chỉ xem; copy trống: `Không có ảnh — chỉ có khi tài xế báo cáo`.
- Mỗi task kết thúc bằng `npm run build` PASS trước khi commit.
- Reply tiếng Việt khi trao đổi với user.

## File map

| File | Responsibility |
|------|----------------|
| `src/types/index.ts` | Enums 3 status, `AccidentAttachment`, fields mới, filter state, catalog defaults |
| `src/data/mockData.ts` | Seed records đủ field; ≥1 App TX có ảnh+reporter; ≥1 Web không ảnh |
| `src/utils/activityUtils.ts` | Labels field mới; bỏ so sánh `attachments` (+ reporter snapshot) |
| `src/components/AccidentFormModal.tsx` | Controls mới section incident/other; bỏ select status cũ |
| `src/components/AccidentDetailView.tsx` | Card ghi nhận + handlingSolution + gallery |
| `src/components/IncidentAttachmentsGallery.tsx` | Gallery thumbnail chỉ đọc (file mới) |
| `src/components/AccidentTable.tsx` | Cột mã/loại/nguồn + 3 badge |
| `src/components/AccidentFilterCard.tsx` | 3 filter status + loại sự cố |
| `src/App.tsx` | Filter state, KPI theo `processingStatus`, lookup options, map form values |
| `src/styles/fieldStyles.ts` | Class width filter mới nếu cần |

---

### Task 1: Types + catalog defaults

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `ReceptionStatus`, `ProcessingStatus`, `OverallStatus`, `AccidentAttachment`, `AccidentRecord` (fields mới), `AccidentFilterState` (3 status + `incidentType`), `DEFAULT_INCIDENT_TYPES`, `DEFAULT_SEVERITIES`, `DEFAULT_INFORMATION_SOURCES`, `DEFAULT_REPORTING_DEPARTMENTS`

- [ ] **Step 1: Cập nhật `src/types/index.ts`**

Xóa `AccidentStatus`. Thêm:

```ts
export type ReceptionStatus = "Chưa tiếp nhận" | "Đã tiếp nhận";
export type ProcessingStatus = "Chưa xử lý" | "Đang xử lý" | "Đã xử lý";
export type OverallStatus = "Đang theo dõi" | "Đóng";

export type AccidentAttachment = {
  id: string;
  name: string;
  url: string;
};
```

Cập nhật `AccidentRecord` — **bỏ** `status`, **thêm**:

```ts
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
```

Giữ nguyên các field cũ (`tnds`, `materialDamage`, `insurancePaymentMethod`, …).

Cập nhật `AccidentFilterState`:

```ts
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
};
```

Thêm catalogs:

```ts
export const DEFAULT_INCIDENT_TYPES = [
  "Tai nạn giao thông",
  "Va chạm",
  "Hỏng hóc kỹ thuật",
  "Sự cố khác",
];

export const DEFAULT_SEVERITIES = ["Thấp", "Trung bình", "Cao", "Nghiêm trọng"];

export const DEFAULT_INFORMATION_SOURCES = ["Camera", "Báo cáo tài xế", "Hotline", "Khách hàng"];

export const DEFAULT_REPORTING_DEPARTMENTS = ["An toàn", "Điều vận", "Kỹ thuật"];
```

- [ ] **Step 2: Verify TypeScript báo lỗi ở consumer (expected)**

Run: `npm run build`  
Expected: FAIL với lỗi thiếu property trên mock/App/form/table/… (xác nhận types đã break đúng chỗ).

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "refactor(types): thay status bang 3 trang thai va field schema Incident"
```

---

### Task 2: Mock data

**Files:**
- Modify: `src/data/mockData.ts`

**Interfaces:**
- Consumes: `AccidentRecord` mới từ Task 1
- Produces: `DEFAULT_ACCIDENTS` đủ field; ≥1 `source: "App Tài xế"` có `attachments` + reporter; ≥1 `source: "Web"` với `attachments: []`

- [ ] **Step 1: Cập nhật mọi phần tử trong `DEFAULT_ACCIDENTS`**

Với mỗi record cũ, map:

| Cũ `status` | `receptionStatus` | `processingStatus` | `overallStatus` |
|-------------|-------------------|--------------------|-----------------|
| Chưa xử lý | Chưa tiếp nhận hoặc Đã tiếp nhận (tuỳ record) | Chưa xử lý | Đang theo dõi |
| Theo dõi | Đã tiếp nhận | Đang xử lý | Đang theo dõi |
| Đã xử lý | Đã tiếp nhận | Đã xử lý | Đóng |

Thêm field mẫu (ví dụ record App):

```ts
code: "TN-20260702-001",
incidentType: "Va chạm",
recordedAt: "2026-07-02T08:15:00",
source: "App Tài xế",
reporterFullName: "Nguyễn Văn An",
reporterEmail: "an.nguyen@example.com",
reporterPhone: "0901234567",
reporterRoleName: "Tài xế",
severity: "Trung bình",
informationSource: "Báo cáo tài xế",
reportingDepartment: "An toàn",
handlingSolution: "",
attachments: [
  {
    id: "att-001-1",
    name: "hien-truong-1.jpg",
    url: "https://picsum.photos/seed/tn001a/400/300",
  },
  {
    id: "att-001-2",
    name: "hien-truong-2.jpg",
    url: "https://picsum.photos/seed/tn001b/400/300",
  },
],
```

Ít nhất một record Web:

```ts
code: "TN-20260705-003",
source: "Web",
recordedAt: "2026-07-05T09:00:00",
reporterFullName: "",
reporterEmail: "",
reporterPhone: "",
reporterRoleName: "",
attachments: [],
```

Đảm bảo mọi record có đủ field mới (string `""` / array `[]` nếu trống).

- [ ] **Step 2: Build**

Run: `npm run build`  
Expected: vẫn FAIL ở App/form/table/filter/activity (mock OK nếu không còn lỗi trên `mockData.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/data/mockData.ts
git commit -m "chore(mock): bo sung field schema Incident cho seed data"
```

---

### Task 3: Activity labels

**Files:**
- Modify: `src/utils/activityUtils.ts`

**Interfaces:**
- Consumes: `AccidentRecord` mới
- Produces: `AccidentComparableValues` = `Omit<AccidentRecord, "id" | "activityLogs" | "attachments" | "reporterFullName" | "reporterEmail" | "reporterPhone" | "reporterRoleName">`; `ACCIDENT_FIELD_LABELS` đủ key comparable

- [ ] **Step 1: Cập nhật comparable + labels**

```ts
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
```

Cập nhật `toComparableFormValues` để destructure bỏ đúng các field omitted.

Trong `formatActivityFieldValue`, nếu cần format `recordedAt` bằng `formatViDate` hoặc `toLocaleString` đơn giản — chỉ display, không logic mới.

Xóa label `status`.

- [ ] **Step 2: Build** (có thể vẫn FAIL ở UI)

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/utils/activityUtils.ts
git commit -m "refactor(activity): labels cho field schema Incident"
```

---

### Task 4: Form modal — fields mới

**Files:**
- Modify: `src/components/AccidentFormModal.tsx`

**Interfaces:**
- Consumes: catalogs + 3 status types; props thêm `incidentTypeOptions`, `severityOptions`, `informationSourceOptions`, `reportingDepartmentOptions` + 4 `on*Change` (cùng pattern `causeOptions`)
- Produces: `AccidentFormValues` vẫn `Omit<AccidentRecord, "id" | "activityLogs">`; `createEmptyAccidentForm` có giá trị mẫu system fields

- [ ] **Step 1: Props + empty form + bỏ STATUS_ITEMS**

Thêm props options/handlers cho 4 lookup mới (mirror `causeOptions`).

Xóa `STATUS_ITEMS` / `AccidentStatus`. Thêm:

```ts
const RECEPTION_ITEMS = [
  { id: "Chưa tiếp nhận", label: "Chưa tiếp nhận" },
  { id: "Đã tiếp nhận", label: "Đã tiếp nhận" },
];
const PROCESSING_ITEMS = [
  { id: "Chưa xử lý", label: "Chưa xử lý" },
  { id: "Đang xử lý", label: "Đang xử lý" },
  { id: "Đã xử lý", label: "Đã xử lý" },
];
const OVERALL_ITEMS = [
  { id: "Đang theo dõi", label: "Đang theo dõi" },
  { id: "Đóng", label: "Đóng" },
];
```

`createEmptyAccidentForm`:

```ts
export function createEmptyAccidentForm(today: string): AccidentFormValues {
  return {
    code: "TN-20260718-001",
    incidentType: "",
    receptionStatus: "Chưa tiếp nhận",
    processingStatus: "Chưa xử lý",
    overallStatus: "Đang theo dõi",
    recordedAt: `${today}T00:00:00`,
    source: "Web",
    reporterFullName: "",
    reporterEmail: "",
    reporterPhone: "",
    reporterRoleName: "",
    severity: "",
    informationSource: "",
    reportingDepartment: "",
    handlingSolution: "",
    attachments: [],
    area: "HCM",
    vehicleId: "",
    driverName: "",
    incidentLocation: "",
    incidentDate: today,
    // ... giữ phần còn lại như hiện tại (insurance, payment, tnds, ...)
  };
}
```

- [ ] **Step 2: JSX section `incident`**

Trong `incidentFields`, **thay** Autocomplete/select `status` bằng:

1. `CreatableLookupField` — Loại sự cố (`incidentType`)
2. `CreatableLookupField` — Mức độ (`severity`)
3. 3 Autocomplete/select — tiếp nhận / xử lý / tổng thể (cùng component đang dùng cho status cũ)
4. `CreatableLookupField` — Nguồn thông tin
5. `CreatableLookupField` — Bộ phận ghi nhận

Giữ xe, tài xế, địa điểm, ngày như cũ. **Không** render `code`, `source`, `recordedAt`, reporter, `attachments`.

- [ ] **Step 3: JSX section `other`**

Thêm textarea `handlingSolution` (label “Giải pháp xử lý”), cạnh `notes`.

- [ ] **Step 4: Không thêm validation mới** — giữ `validateForm` hiện tại.

- [ ] **Step 5: Build** (có thể FAIL ở App vì props thiếu)

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/components/AccidentFormModal.tsx
git commit -m "feat(form): bo sung field schema Incident tren modal"
```

---

### Task 5: Gallery + Chi tiết

**Files:**
- Create: `src/components/IncidentAttachmentsGallery.tsx`
- Modify: `src/components/AccidentDetailView.tsx`

**Interfaces:**
- Consumes: `AccidentAttachment[]`, `AccidentRecord`
- Produces: gallery chỉ đọc; card “Thông tin ghi nhận” không nút sửa

- [ ] **Step 1: Tạo gallery**

```tsx
import type { AccidentAttachment } from "../types";

type Props = { attachments: AccidentAttachment[] };

export default function IncidentAttachmentsGallery({ attachments }: Props) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Không có ảnh — chỉ có khi tài xế báo cáo
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {attachments.map((file) => (
        <li key={file.id} className="min-w-0 overflow-hidden rounded-lg border border-slate-200">
          <img src={file.url} alt={file.name} className="h-28 w-full object-cover" />
          <p className="truncate px-2 py-1 text-xs text-slate-600" title={file.name}>
            {file.name}
          </p>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Cập nhật `AccidentDetailView`**

- Thay badge `record.status` trong card “Thông tin sự cố” bằng 3 `DetailItem` (tiếp nhận / xử lý / tổng thể) + thêm Loại sự cố, Mức độ, Nguồn thông tin, Bộ phận ghi nhận.
- Card “Bảo hiểm & thông tin khác”: thêm `handlingSolution`.
- Thêm section **không** `onEdit` (tự viết `ReadOnlyDetailSection` hoặc section không nút sửa):

Title: `Thông tin ghi nhận`  
Items: mã, nguồn, `recordedAt` (format ngày/giờ đơn giản), reporter ×4, rồi `<IncidentAttachmentsGallery attachments={record.attachments} />` full-width dưới grid nếu cần.

Helper badge class: tách 3 hàm nhỏ theo từng enum (màu tương tự status cũ).

- [ ] **Step 3: Build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/IncidentAttachmentsGallery.tsx src/components/AccidentDetailView.tsx
git commit -m "feat(detail): card thong tin ghi nhan va gallery anh chi doc"
```

---

### Task 6: Table list

**Files:**
- Modify: `src/components/AccidentTable.tsx`

- [ ] **Step 1: Cột mới**

Đầu `<thead>` (trước Số xe): thêm `Mã`, `Loại sự cố`.  
Sau khu vực hoặc gần cuối trước Thao tác: thêm `Nguồn`.  
Thay cột `Trạng thái` bằng một cột (hoặc 3 cột hẹp) hiện 3 badge:

```tsx
<td className={bodyClass}>
  <div className="flex flex-col gap-1">
    <span className={cn("inline-flex ...", receptionBadgeClass(row.receptionStatus))}>
      {row.receptionStatus}
    </span>
    <span className={cn("inline-flex ...", processingBadgeClass(row.processingStatus))}>
      {row.processingStatus}
    </span>
    <span className={cn("inline-flex ...", overallBadgeClass(row.overallStatus))}>
      {row.overallStatus}
    </span>
  </div>
</td>
```

Cells: `row.code`, `row.incidentType || "—"`, `row.source`.  
Xóa mọi reference `row.status` / `AccidentStatus`.

Tăng `min-w-[2400px]` nếu cần (vd. `min-w-[2800px]`).

- [ ] **Step 2: Build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/AccidentTable.tsx
git commit -m "feat(table): cot ma, loai, nguon va 3 badge trang thai"
```

---

### Task 7: Filter card + field styles

**Files:**
- Modify: `src/components/AccidentFilterCard.tsx`
- Modify: `src/styles/fieldStyles.ts` (nếu cần class width mới)

- [ ] **Step 1: Thay filter status**

Xóa `statusOptions` / `filter.status`.  
Thêm 4 `FilterAutocomplete`:

- Tiếp nhận — options `all` + 2 giá trị `ReceptionStatus`
- Xử lý — `all` + 3 `ProcessingStatus`
- Tổng thể — `all` + 2 `OverallStatus`
- Loại sự cố — nhận prop `incidentTypeOptions: string[]` từ App (`["all","Tất cả loại"]` + map)

Props mới:

```ts
type AccidentFilterCardProps = {
  filter: AccidentFilterState;
  drivers: Driver[];
  vehicles: Vehicle[];
  incidentTypeOptions: string[];
  onChange: (patch: Partial<AccidentFilterState>) => void;
};
```

Layout: giữ bar hiện có; thêm filter mới vào hàng (có thể wrap). Dùng class width tương tự `FILTER_STATUS_FIELD_CLASS` hoặc duplicate thành `FILTER_STATUS_SM_CLASS`.

- [ ] **Step 2: Build** (App có thể FAIL props)

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/AccidentFilterCard.tsx src/styles/fieldStyles.ts
git commit -m "feat(filter): loc theo 3 trang thai va loai su co"
```

---

### Task 8: App wiring (glue tối thiểu)

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: tất cả types/options/components từ task trước
- Produces: app compile + filter/KPI/form props hoạt động

- [ ] **Step 1: State filter + lookup options**

```ts
const [filter, setFilter] = useState<AccidentFilterState>({
  startDate: defaultDateRange.startDate,
  endDate: defaultDateRange.endDate,
  areaId: "all",
  driverId: "all",
  vehicleId: "all",
  receptionStatus: "all",
  processingStatus: "all",
  overallStatus: "all",
  incidentType: "all",
});

const [incidentTypeOptions, setIncidentTypeOptions] = useState([...DEFAULT_INCIDENT_TYPES]);
const [severityOptions, setSeverityOptions] = useState([...DEFAULT_SEVERITIES]);
const [informationSourceOptions, setInformationSourceOptions] = useState([
  ...DEFAULT_INFORMATION_SOURCES,
]);
const [reportingDepartmentOptions, setReportingDepartmentOptions] = useState([
  ...DEFAULT_REPORTING_DEPARTMENTS,
]);
```

- [ ] **Step 2: `toFormValues` + filter + KPI**

`toFormValues`: copy đủ field record trừ `id`/`activityLogs`.

Filter:

```ts
if (filter.receptionStatus !== "all" && row.receptionStatus !== filter.receptionStatus) return false;
if (filter.processingStatus !== "all" && row.processingStatus !== filter.processingStatus) return false;
if (filter.overallStatus !== "all" && row.overallStatus !== filter.overallStatus) return false;
if (filter.incidentType !== "all" && row.incidentType !== filter.incidentType) return false;
```

KPI (theo `processingStatus` — chỉ đổi field đọc, không logic mới):

```ts
const pending = filteredRecords.filter((r) => r.processingStatus === "Chưa xử lý").length;
const inProgress = filteredRecords.filter((r) => r.processingStatus === "Đang xử lý").length;
const resolved = filteredRecords.filter((r) => r.processingStatus === "Đã xử lý").length;
// labels: Chưa xử lý / Đang xử lý / Đã xử lý
```

- [ ] **Step 3: Pass props form + filter**

`AccidentFilterCard`: `incidentTypeOptions={incidentTypeOptions}`.  
`AccidentFormModal`: 4 options + 4 onChange setters.

`handleSubmit` create/edit: giữ spread `...values` như hiện tại (system fields đã nằm trong values từ empty/edit) — **không** thêm generator code.

- [ ] **Step 4: Build PASS**

Run: `npm run build`  
Expected: PASS (exit 0).

- [ ] **Step 5: Smoke UI thủ công**

Run: `npm run dev`  
Checklist:

1. List hiện mã, loại, nguồn, 3 badge  
2. Filter 3 status + loại hoạt động  
3. Chi tiết: card ghi nhận + ảnh (record App) / empty copy (record Web)  
4. Form create: có field mới, không upload ảnh, không hiện mã/reporter  
5. Edit section vẫn mở đúng nhóm  

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): wire filter, KPI va lookup options theo schema Incident"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| Bỏ `status`, thêm 3 status | 1, 4, 5, 6, 7, 8 |
| Fields mới trên record | 1, 2 |
| Catalogs lookup | 1, 4, 8 |
| Form section incident/other | 4 |
| Không form system/ảnh | 4 |
| Card Thông tin ghi nhận + gallery | 5 |
| List cột + 3 badge | 6 |
| Filter 3 status + loại | 7, 8 |
| Activity labels, bỏ log attachments/reporter | 3 |
| Mock App có ảnh / Web không ảnh | 2 |
| UI-only, không logic mới | Global + mọi task |
| Giữ validation cũ | 4 |
| KPI cập nhật để compile | 8 |

## Self-review notes

- Không có test runner → verify = `npm run build` + smoke checklist Task 8.
- Không rename `tnds` / `paymentMethod` (Global Constraints).
- `AccidentFormValues` giữ đủ system fields để edit không làm mất snapshot; UI không render chúng.
