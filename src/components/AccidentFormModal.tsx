import { useEffect, useId, useMemo, useState } from "react";

import type {
  AccidentRecord,
  AccidentStatus,
  AreaCode,
  DetailType,
  Driver,
  TimeOfDay,
  Vehicle,
  YesNo,
} from "../types";
import { AREA_LABEL_BY_CODE, computeRemainingPayment } from "../types";
import { formatCurrency, parseCurrencyInput } from "../utils/currencyUtils";
import AutocompleteField from "./AutocompleteField";
import CreatableLookupField from "./CreatableLookupField";
import ModalButton from "./modal/ModalButton";
import ModalFieldError from "./modal/ModalFieldError";
import ModalFieldLabel from "./modal/ModalFieldLabel";
import ModalFooter from "./modal/ModalFooter";
import ModalHeader from "./modal/ModalHeader";
import ViDateInput from "./ViDateInput";
import { cn, textareaClass } from "./ui";
import { MODAL_BODY_CLASS, MODAL_CONTAINER_CLASS, MODAL_NATIVE_INPUT_CLASS } from "../styles/modalStyles";

export type AccidentFormValues = Omit<AccidentRecord, "id">;

type AccidentFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: AccidentFormValues;
  drivers: Driver[];
  vehicles: Vehicle[];
  insuranceOptions: string[];
  assessorOptions: string[];
  onInsuranceOptionsChange: (options: string[]) => void;
  onAssessorOptionsChange: (options: string[]) => void;
  onClose: () => void;
  onSubmit: (values: AccidentFormValues) => void;
};

const STATUS_ITEMS = [
  { id: "Chưa xử lý", label: "Chưa xử lý" },
  { id: "Theo dõi", label: "Theo dõi" },
  { id: "Đã xử lý", label: "Đã xử lý" },
];

const AREA_ITEMS = [
  { id: "CLO", label: "Cửa Lò" },
  { id: "HAI_PHONG", label: "Hải Phòng" },
  { id: "HCM", label: "Hồ Chí Minh" },
];

const DETAIL_ITEMS = [
  { id: "Chủ quan", label: "Chủ quan" },
  { id: "Khách quan", label: "Khách quan" },
];

const TIME_ITEMS = [
  { id: "Ngày", label: "Ngày" },
  { id: "Đêm", label: "Đêm" },
];

const YES_NO_ITEMS = [
  { id: "Có", label: "Có" },
  { id: "Không", label: "Không" },
];

type FieldKey =
  | "driver"
  | "vehicleId"
  | "incidentDate"
  | "incidentLocation"
  | "area";

type FormErrors = Partial<Record<FieldKey, string>>;

function validateForm(form: AccidentFormValues, selectedDriverId: string): FormErrors {
  const errors: FormErrors = {};

  if (!selectedDriverId) errors.driver = "Vui lòng chọn tài xế";
  if (!form.vehicleId) errors.vehicleId = "Vui lòng chọn số xe";
  if (!form.area) errors.area = "Vui lòng chọn khu vực";
  if (!form.incidentDate) errors.incidentDate = "Vui lòng chọn ngày xảy ra sự cố";
  if (!form.incidentLocation.trim()) errors.incidentLocation = "Vui lòng nhập địa điểm";

  return errors;
}

function CurrencyInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [display, setDisplay] = useState(formatCurrency(value));

  useEffect(() => {
    setDisplay(value ? formatCurrency(value) : "");
  }, [value]);

  return (
    <div className="space-y-1.5">
      <ModalFieldLabel htmlFor={id}>{label}</ModalFieldLabel>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        className={MODAL_NATIVE_INPUT_CLASS}
        value={display}
        onChange={(event) => {
          const next = parseCurrencyInput(event.target.value);
          setDisplay(event.target.value);
          onChange(next);
        }}
        onBlur={() => setDisplay(value ? formatCurrency(value) : "")}
      />
    </div>
  );
}

export default function AccidentFormModal({
  open,
  mode,
  initialValues,
  drivers,
  vehicles,
  insuranceOptions,
  assessorOptions,
  onInsuranceOptionsChange,
  onAssessorOptionsChange,
  onClose,
  onSubmit,
}: AccidentFormModalProps) {
  const titleId = useId();
  const [form, setForm] = useState<AccidentFormValues>(initialValues);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initialValues);
    const matchedDriver = drivers.find((driver) => driver.name === initialValues.driverName);
    setSelectedDriverId(matchedDriver?.id ?? "");
    setSubmitted(false);
  }, [open, initialValues, drivers]);

  const driverOptions = useMemo(
    () => drivers.map((driver) => ({ id: driver.id, label: driver.name })),
    [drivers]
  );

  const vehiclesInArea = useMemo(
    () => (form.area ? vehicles.filter((vehicle) => vehicle.area === form.area) : vehicles),
    [form.area, vehicles]
  );

  const vehicleOptions = useMemo(
    () =>
      vehiclesInArea.map((vehicle) => ({
        id: vehicle.id,
        label: vehicle.plateNumber,
        sublabel: vehicle.areaLabel,
      })),
    [vehiclesInArea]
  );

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicleId);
  const errors = useMemo(() => validateForm(form, selectedDriverId), [form, selectedDriverId]);
  const remaining = computeRemainingPayment(form);

  const showError = (field: FieldKey) => submitted && !!errors[field];

  const patchForm = (patch: Partial<AccidentFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    const driver = drivers.find((item) => item.id === driverId);
    patchForm({ driverName: driver?.name ?? "" });
  };

  const handleAreaChange = (area: string) => {
    const nextArea = area as AreaCode;
    const vehicleStillValid = vehicles.some(
      (vehicle) => vehicle.id === form.vehicleId && vehicle.area === nextArea
    );
    patchForm({
      area: nextArea,
      vehicleId: vehicleStillValid ? form.vehicleId : "",
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validateForm(form, selectedDriverId);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      ...form,
      driverName: form.driverName.trim(),
      incidentLocation: form.incidentLocation.trim(),
      insuranceCompany: form.insuranceCompany.trim(),
      assessor: form.assessor.trim(),
      description: form.description.trim(),
      cause: form.cause.trim(),
      notes: form.notes.trim(),
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(MODAL_CONTAINER_CLASS, "max-w-6xl")}
        onClick={(event) => event.stopPropagation()}
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <ModalHeader
            titleId={titleId}
            title={mode === "create" ? "Thêm tai nạn/sự cố" : "Chỉnh sửa tai nạn/sự cố"}
            onClose={onClose}
          />

          <div className={cn(MODAL_BODY_CLASS, "grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
            <AutocompleteField
              label="Trạng thái"
              value={form.status}
              options={STATUS_ITEMS}
              placeholder="Chọn trạng thái"
              searchable={false}
              onChange={(status) => patchForm({ status: status as AccidentStatus })}
            />

            <AutocompleteField
              label="Khu vực"
              required
              value={form.area}
              options={AREA_ITEMS}
              placeholder="Chọn khu vực"
              searchable={false}
              error={errors.area}
              showError={showError("area")}
              onChange={handleAreaChange}
            />

            <AutocompleteField
              label="Số xe"
              required
              value={form.vehicleId}
              options={vehicleOptions}
              placeholder="Chọn số xe"
              searchPlaceholder="Tìm biển số..."
              hint={selectedVehicle ? `Khu vực: ${selectedVehicle.areaLabel}` : undefined}
              error={errors.vehicleId}
              showError={showError("vehicleId")}
              onChange={(vehicleId) => {
                const vehicle = vehicles.find((item) => item.id === vehicleId);
                patchForm({
                  vehicleId,
                  area: vehicle?.area ?? form.area,
                });
              }}
            />

            <AutocompleteField
              label="Tài xế"
              required
              value={selectedDriverId}
              options={driverOptions}
              placeholder="Chọn tài xế"
              searchPlaceholder="Tìm tài xế..."
              error={errors.driver}
              showError={showError("driver")}
              onChange={handleDriverChange}
            />

            <div className="space-y-1.5 sm:col-span-2">
              <ModalFieldLabel required htmlFor="incident-location">
                Địa điểm xảy ra tai nạn
              </ModalFieldLabel>
              <input
                id="incident-location"
                type="text"
                className={cn(
                  MODAL_NATIVE_INPUT_CLASS,
                  showError("incidentLocation") && "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                )}
                value={form.incidentLocation}
                onChange={(event) => patchForm({ incidentLocation: event.target.value })}
              />
              {showError("incidentLocation") ? (
                <ModalFieldError message={errors.incidentLocation} />
              ) : null}
            </div>

            <div className="space-y-1.5">
              <ModalFieldLabel required htmlFor="incident-date">
                Ngày xảy ra sự cố
              </ModalFieldLabel>
              <ViDateInput
                id="incident-date"
                aria-label="Ngày xảy ra sự cố"
                aria-invalid={showError("incidentDate")}
                className={cn(
                  MODAL_NATIVE_INPUT_CLASS,
                  showError("incidentDate") && "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                )}
                value={form.incidentDate}
                onChange={(incidentDate) => patchForm({ incidentDate })}
              />
              {showError("incidentDate") ? <ModalFieldError message={errors.incidentDate} /> : null}
            </div>

            <CreatableLookupField
              label="Đơn vị Bảo hiểm"
              value={form.insuranceCompany}
              options={insuranceOptions}
              placeholder="Chọn đơn vị bảo hiểm"
              onChange={(insuranceCompany) => patchForm({ insuranceCompany })}
              onOptionsChange={onInsuranceOptionsChange}
            />

            <CreatableLookupField
              label="Giám định viên"
              value={form.assessor}
              options={assessorOptions}
              placeholder="Chọn giám định viên"
              onChange={(assessor) => patchForm({ assessor })}
              onOptionsChange={onAssessorOptionsChange}
            />

            <AutocompleteField
              label="Chi tiết"
              value={form.detailType}
              options={DETAIL_ITEMS}
              placeholder="Chủ quan/Khách quan"
              searchable={false}
              onChange={(detailType) => patchForm({ detailType: detailType as DetailType })}
            />

            <AutocompleteField
              label="Thời điểm"
              value={form.timeOfDay}
              options={TIME_ITEMS}
              placeholder="Ngày/Đêm"
              searchable={false}
              onChange={(timeOfDay) => patchForm({ timeOfDay: timeOfDay as TimeOfDay })}
            />

            <div className="space-y-1.5">
              <ModalFieldLabel htmlFor="completion-date">Ngày hoàn thành hồ sơ</ModalFieldLabel>
              <ViDateInput
                id="completion-date"
                aria-label="Ngày hoàn thành hồ sơ"
                className={MODAL_NATIVE_INPUT_CLASS}
                value={form.completionDate}
                onChange={(completionDate) => patchForm({ completionDate })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <ModalFieldLabel htmlFor="description">Diễn giải</ModalFieldLabel>
              <textarea
                id="description"
                className={textareaClass}
                rows={2}
                value={form.description}
                onChange={(event) => patchForm({ description: event.target.value })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <ModalFieldLabel htmlFor="cause">Nguyên nhân</ModalFieldLabel>
              <textarea
                id="cause"
                className={textareaClass}
                rows={2}
                value={form.cause}
                onChange={(event) => patchForm({ cause: event.target.value })}
              />
            </div>

            <CurrencyInput
              id="total-loss"
              label="Tổn thất"
              value={form.totalLoss}
              onChange={(totalLoss) => patchForm({ totalLoss })}
            />

            <CurrencyInput
              id="insurance-pay"
              label="BH đền"
              value={form.insurancePay}
              onChange={(insurancePay) => patchForm({ insurancePay })}
            />

            <CurrencyInput
              id="driver-pay"
              label="TX chịu"
              value={form.driverPay}
              onChange={(driverPay) => patchForm({ driverPay })}
            />

            <CurrencyInput
              id="company-share"
              label="Cty chia sẻ"
              value={form.companyShare}
              onChange={(companyShare) => patchForm({ companyShare })}
            />

            <div className="space-y-1.5">
              <ModalFieldLabel htmlFor="payment-date">Ngày thanh toán</ModalFieldLabel>
              <ViDateInput
                id="payment-date"
                aria-label="Ngày thanh toán"
                className={MODAL_NATIVE_INPUT_CLASS}
                value={form.paymentDate}
                onChange={(paymentDate) => patchForm({ paymentDate })}
              />
            </div>

            <div className="space-y-1.5">
              <ModalFieldLabel>Còn lại phải thanh toán</ModalFieldLabel>
              <div className="flex h-10 items-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-800 tabular-nums">
                {formatCurrency(remaining)}
              </div>
            </div>

            <AutocompleteField
              label="TNDS"
              value={form.tnds}
              options={YES_NO_ITEMS}
              placeholder="Có/Không"
              searchable={false}
              onChange={(tnds) => patchForm({ tnds: tnds as YesNo })}
            />

            <AutocompleteField
              label="Vật chất"
              value={form.materialDamage}
              options={YES_NO_ITEMS}
              placeholder="Có/Không"
              searchable={false}
              onChange={(materialDamage) => patchForm({ materialDamage: materialDamage as YesNo })}
            />

            <div className="space-y-1.5">
              <ModalFieldLabel htmlFor="vehicle-stop-days">Số ngày xe dừng</ModalFieldLabel>
              <input
                id="vehicle-stop-days"
                type="number"
                min={0}
                className={MODAL_NATIVE_INPUT_CLASS}
                value={form.vehicleStopDays}
                onChange={(event) =>
                  patchForm({ vehicleStopDays: Math.max(0, Number(event.target.value) || 0) })
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <ModalFieldLabel htmlFor="notes">Ghi chú</ModalFieldLabel>
              <textarea
                id="notes"
                className={textareaClass}
                rows={2}
                value={form.notes}
                onChange={(event) => patchForm({ notes: event.target.value })}
              />
            </div>
          </div>

          <ModalFooter>
            <ModalButton variant="cancel" type="button" showIcon={false} onClick={onClose}>
              Hủy
            </ModalButton>
            <ModalButton variant="primary" type="submit">
              {mode === "create" ? "Thêm" : "Lưu"}
            </ModalButton>
          </ModalFooter>
        </form>
      </div>
    </div>
  );
}

export function createEmptyAccidentForm(today: string): AccidentFormValues {
  return {
    status: "Chưa xử lý",
    area: "HCM",
    vehicleId: "",
    driverName: "",
    incidentLocation: "",
    incidentDate: today,
    insuranceCompany: "",
    assessor: "",
    description: "",
    cause: "",
    detailType: "Chủ quan",
    timeOfDay: "Ngày",
    completionDate: "",
    totalLoss: 0,
    insurancePay: 0,
    driverPay: 0,
    companyShare: 0,
    paymentDate: "",
    tnds: "Không",
    materialDamage: "Không",
    vehicleStopDays: 0,
    notes: "",
  };
}

export function areaLabel(area: AreaCode): string {
  return AREA_LABEL_BY_CODE[area];
}
