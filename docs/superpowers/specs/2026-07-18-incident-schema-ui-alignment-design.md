# Design: Căn chỉnh UI prototype với schema Incident

**Ngày:** 2026-07-18  
**Prototype:** `109_tai_nan_su_co_cua_xe`  
**Schema tham chiếu:** `safety-000406/prisma/models/incident.prisma`  
**Trạng thái:** Đã duyệt thiết kế (brainstorming)

## Mục tiêu

Bổ sung **giao diện prototype** (form, chi tiết, list, filter, mock data, label activity) để khớp các trường của model `Incident` trong schema, giữ pattern UI hiện tại.

## Quyết định đã chốt

| Chủ đề | Quyết định |
|--------|------------|
| Cách làm | **Chỉ điều chỉnh prototype / UI + mock** — không viết logic nghiệp vụ mới |
| Phạm vi UI | Toàn bộ trường còn thiếu so với schema (form + chi tiết + list/filter) |
| Trạng thái | Thay hoàn toàn `status` cũ bằng 3 trường: tiếp nhận / xử lý / tổng thể |
| Ảnh đính kèm | Chỉ hiển thị (read-only) từ báo cáo tài xế; Web không upload |
| Snapshot hệ thống | `code`, `source`, `recordedAt`, reporter*, `attachments` chỉ xem trên Chi tiết; form Web không hiện |
| Layout | Mở rộng card/section hiện có + 1 card chỉ đọc “Thông tin ghi nhận” |
| Mã sự cố | Hiển thị format `TN-YYYYMMDD-xxx` trên mock / giá trị mẫu khi tạo — **không** code thuật toán sinh mã thật |

## Ngoài phạm vi

- API / Prisma / persistence thật
- Upload file lên server
- Soft-delete catalog master
- Phân quyền theo role
- **Logic nghiệp vụ mới:** validate rule mới, auto-tính tiền, workflow chuyển trạng thái, sinh mã theo sequence, sync catalog, v.v.
- Refactor sâu ngoài phần cần để hiện field mới
---

## 1. Mô hình dữ liệu (types)

### 1.1 Bỏ

- `AccidentStatus` và field `status` trên `AccidentRecord` / filter

### 1.2 Enums mới (nhãn tiếng Việt trên UI)

```ts
type ReceptionStatus = "Chưa tiếp nhận" | "Đã tiếp nhận";
type ProcessingStatus = "Chưa xử lý" | "Đang xử lý" | "Đã xử lý";
type OverallStatus = "Đang theo dõi" | "Đóng";
```

Map schema:

| Schema | UI label |
|--------|----------|
| `NOT_RECEIVED` / `RECEIVED` | Chưa tiếp nhận / Đã tiếp nhận |
| `NOT_PROCESSED` / `IN_PROGRESS` / `PROCESSED` | Chưa xử lý / Đang xử lý / Đã xử lý |
| `MONITORING` / `CLOSED` | Đang theo dõi / Đóng |

Giữ: `DetailType`, `TimeOfDay`, `YesNo` (hoặc boolean nội bộ với label Có/Không).

### 1.3 Fields mới trên `AccidentRecord`

| Field | Type | Ghi chú |
|-------|------|---------|
| `code` | `string` | Format `TN-YYYYMMDD-xxx` |
| `incidentType` | `string` | Lookup CreatableLookup |
| `receptionStatus` | `ReceptionStatus` | |
| `processingStatus` | `ProcessingStatus` | |
| `overallStatus` | `OverallStatus` | |
| `recordedAt` | `string` (ISO) | Default now khi tạo Web |
| `source` | `string` | `"Web"` \| `"App Tài xế"` (và mock tương đương) |
| `reporterFullName` | `string` | Có thể `""` nếu tạo Web |
| `reporterEmail` | `string` | |
| `reporterPhone` | `string` | |
| `reporterRoleName` | `string` | |
| `severity` | `string` | Lookup optional |
| `informationSource` | `string` | Lookup optional |
| `reportingDepartment` | `string` | Lookup optional |
| `handlingSolution` | `string` | Textarea |
| `attachments` | `AccidentAttachment[]` | Xem bên dưới |

### 1.4 Đổi tên nội bộ (khuyến nghị, label UI giữ quen thuộc)

| Cũ | Mới | Label UI |
|----|-----|----------|
| `tnds` | `hasTndsInsurance` | TNDS |
| `materialDamage` | `hasMaterialInsurance` | Vật chất |
| `insurancePaymentMethod` | `paymentMethod` | Hình thức bảo hiểm thanh toán |

### 1.5 Attachment

```ts
type AccidentAttachment = {
  id: string;
  name: string;
  url: string; // URL ảnh mock / object URL chỉ đọc
};
```

Tạo từ Web: `attachments = []`.  
Mock App Tài xế: có 1–n ảnh mẫu.

### 1.6 Filter state

```ts
type AccidentFilterState = {
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

### 1.7 Giá trị mẫu khi tạo từ Web (hardcode / initialValues — không logic)

- `receptionStatus` = Chưa tiếp nhận  
- `processingStatus` = Chưa xử lý  
- `overallStatus` = Đang theo dõi  
- `source` = `"Web"`  
- `recordedAt` = chuỗi ISO mẫu cố định hoặc copy pattern hiện có  
- `code` = mã mẫu dạng `TN-YYYYMMDD-xxx` (gán sẵn trong initialValues / mock, không sequence engine)  
- `attachments` = `[]`  
- reporter* = `""`
---

## 2. Form & Chi tiết

### 2.1 Form Thêm/Sửa (Web) — editable

Giữ `AccidentEditSection`: `incident` | `content` | `payment` | `other`.

**Section `incident` — thêm:**

- Loại sự cố (CreatableLookup, bắt buộc)
- Mức độ (CreatableLookup, optional)
- Trạng thái tiếp nhận (select)
- Trạng thái xử lý (select)
- Trạng thái tổng thể (select)
- Nguồn thông tin (CreatableLookup, optional)
- Bộ phận ghi nhận (CreatableLookup, optional)

**Section `other` — thêm:**

- Giải pháp xử lý (textarea)

**Không hiện trên form:** `code`, `source`, `recordedAt`, reporter*, `attachments`.

### 2.2 Validation

- **Giữ nguyên** validation UI đã có (tài xế, xe, ngày, địa điểm, remainingPayment).
- **Không thêm** rule nghiệp vụ mới (không bắt buộc thêm Loại sự cố bằng logic mới; field hiện đủ trên form là đủ).
- 3 trạng thái: select luôn có option/giá trị mặc định trên UI.
### 2.3 Chi tiết — card chỉ đọc “Thông tin ghi nhận”

Không có nút sửa. Nội dung:

- Mã sự cố
- Nguồn gửi
- Thời điểm ghi nhận
- Người báo cáo: họ tên, SĐT, email, vai trò (trống → “—”)
- Ảnh đính kèm: grid thumbnail; nếu rỗng → copy: “Không có ảnh — chỉ có khi tài xế báo cáo”

4 card nghiệp vụ giữ nút sửa theo section.  
Card “Thông tin hệ thống” (activity log) giữ nguyên vị trí sidebar.

`handlingSolution` hiển thị trong card “Bảo hiểm & thông tin khác”.

---

## 3. List, filter & activity

### 3.1 Bảng

- Thêm cột: Mã (`code`), Loại sự cố
- Thay cột “Trạng thái” bằng 3 badge: Tiếp nhận / Xử lý / Tổng thể
- Thêm cột: Nguồn
- Giữ cột nghiệp vụ hiện có (xe, TX, ngày, BH, chi phí…)

### 3.2 Bộ lọc

- Bỏ filter status cũ
- Thêm: Tiếp nhận, Xử lý, Tổng thể (mỗi cái có “Tất cả”)
- Thêm: Loại sự cố (Tất cả + options)
- Giữ: từ/đến ngày, khu vực, tài xế, xe

### 3.3 Activity log

Bổ sung `FIELD_LABELS` cho field mới (3 status, loại, mức độ, nguồn TT, bộ phận, giải pháp, rename nội bộ…).

Không ghi log thay đổi `attachments` / reporter snapshot (hệ thống / read-only).

---

## 4. Thành phần & file

| File | Thay đổi |
|------|----------|
| `src/types/index.ts` | Types, enums, defaults catalog mới |
| `src/data/mockData.ts` | Seed đủ field; vài record App TX có ảnh + reporter |
| `src/App.tsx` | Filter, create defaults, lookup option state |
| `src/components/AccidentFormModal.tsx` | Fields mới theo section |
| `src/components/AccidentDetailView.tsx` | Card ghi nhận + handlingSolution |
| `src/components/AccidentTable.tsx` | Cột mới, 3 badge |
| `src/components/AccidentFilterCard.tsx` | Filter mới |
| `src/utils/activityUtils.ts` | Labels |
| (mới, optional) `IncidentAttachmentsGallery.tsx` | Gallery chỉ xem |

Lookup catalogs mới (CreatableLookup, state ở `App` giống insurance/cause):

- Loại sự cố
- Mức độ
- Nguồn thông tin
- Bộ phận ghi nhận

---

## 5. Cách làm prototype (không logic)

- Cập nhật types + mock + JSX form/detail/table/filter/labels.
- Giữ glue state tối thiểu giống pattern hiện có (controlled form, filter client-side đã có) — **không** thêm module nghiệp vụ mới.
- Filter theo field mới = mở rộng điều kiện filter UI hiện có (cùng kiểu so khớp chuỗi), không workflow.

```
User xem list / mở Chi tiết
  → Đọc mock đã đủ field schema
  → Card “Thông tin ghi nhận” + gallery chỉ đọc (nếu có ảnh mock)

User mở form create/edit
  → Hiện thêm input/select theo section
  → Submit: lưu vào state như hiện tại (initialValues đã có sẵn giá trị mẫu)
```

---

## 6. Tiêu chí thành công

1. Không còn `status` đơn trong types / UI / filter.
2. Form Web có đủ control field theo mục 2.1; không có upload ảnh.
3. Chi tiết có card “Thông tin ghi nhận” và gallery chỉ đọc.
4. List hiện mã, loại, 3 badge trạng thái, nguồn; filter theo 3 status + loại.
5. Mock có ít nhất 1 record nguồn App có ảnh và 1 record nguồn Web không ảnh; mã đúng format `TN-YYYYMMDD-xxx`.
6. Không phát sinh file/module logic nghiệp vụ mới ngoài UI + mock + labels.

## 7. Hướng triển khai đã chọn

**Hướng 1:** Mở rộng card/section hiện có + card chỉ đọc “Thông tin ghi nhận” (không wizard, không tách mode App/Web trên form) — **chỉ prototype UI**.
