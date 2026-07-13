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
import { AREA_LABEL_BY_CODE } from "../types";
import { formatCurrency, parseCurrencyInput } from "../utils/currencyUtils";
import AutocompleteField from "./AutocompleteField";
import CreatableLookupField from "./CreatableLookupField";
import ModalButton from "./modal/ModalButton";
import ModalFieldError from "./modal/ModalFieldError";
import ModalFieldLabel from "./modal/ModalFieldLabel";
import ModalFooter from "./modal/ModalFooter";
import ModalHeader from "./modal/ModalHeader";
import ViDateInput from "./ViDateInput";
import ViDatePicker from "./ViDatePicker";
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
  paymentMethodOptions: string[];
  causeOptions: string[];
  onInsuranceOptionsChange: (options: string[]) => void;
  onPaymentMethodOptionsChange: (options: string[]) => void;
  onCauseOptionsChange: (options: string[]) => void;
  onClose: () => void;
  onSubmit: (values: AccidentFormValues) => void;
};

const STATUS_ITEMS = [
  { id: "Chưa xử lý", label: "Chưa xử lý" },
  { id: "Theo dõi", label: "Theo dõi" },
  { id: "Đã xử lý", label: "Đã xử lý" },
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
  | "remainingPayment";

type FormErrors = Partial<Record<FieldKey, string>>;

function validateForm(form: AccidentFormValues, selectedDriverId: string): FormErrors {
  const errors: FormErrors = {};

  if (!selectedDriverId) errors.driver = "Vui lòng chọn tài xế";
  if (!form.vehicleId) errors.vehicleId = "Vui lòng chọn số xe";
  if (!form.incidentDate) errors.incidentDate = "Vui lòng chọn ngày xảy ra sự cố";
  if (!form.incidentLocation.trim()) errors.incidentLocation = "Vui lòng nhập địa điểm";
  if (form.remainingPayment > form.totalLoss) {
    errors.remainingPayment = "Số tiền còn lại phải nhỏ hơn hoặc bằng tổn thất";
  }

  return errors;
}

function CurrencyInput({
  id,
  label,
  value,
  onChange,
  error,
  showError,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  showError?: boolean;
}) {
  const [display, setDisplay] = useState(value ? formatCurrency(value) : "");

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
        aria-invalid={showError}
        className={cn(
          MODAL_NATIVE_INPUT_CLASS,
          "tabular-nums",
          showError && "border-red-400 focus:border-red-500 focus:ring-red-500/30"
        )}
        value={display}
        placeholder="0"
        onChange={(event) => {
          const next = parseCurrencyInput(event.target.value);
          setDisplay(next ? formatCurrency(next) : "");
          onChange(next);
        }}
        onBlur={() => setDisplay(value ? formatCurrency(value) : "")}
      />
      {showError && error ? <ModalFieldError message={error} /> : null}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200">
      <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">
        {title}
      </h3>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export default function AccidentFormModal({
  open,
  mode,
  initialValues,
  drivers,
  vehicles,
  insuranceOptions,
  paymentMethodOptions,
  causeOptions,
  onInsuranceOptionsChange,
  onPaymentMethodOptionsChange,
  onCauseOptionsChange,
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

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: vehicle.plateNumber,
        sublabel: vehicle.areaLabel,
      })),
    [vehicles]
  );

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicleId);
  const areaDisplay = selectedVehicle?.areaLabel ?? "—";
  const errors = useMemo(() => validateForm(form, selectedDriverId), [form, selectedDriverId]);

  const showError = (field: FieldKey) => submitted && !!errors[field];

  const patchForm = (patch: Partial<AccidentFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    const driver = drivers.find((item) => item.id === driverId);
    patchForm({ driverName: driver?.name ?? "" });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validateForm(form, selectedDriverId);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      ...form,
      area: selectedVehicle?.area ?? form.area,
      driverName: form.driverName.trim(),
      incidentLocation: form.incidentLocation.trim(),
      insuranceCompany: form.insuranceCompany.trim(),
      assessor: form.assessor.trim(),
      description: form.description.trim(),
      cause: form.cause.trim(),
      insurancePaymentMethod: form.insurancePaymentMethod.trim(),
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

          <div className={cn(MODAL_BODY_CLASS, "space-y-4")}>
            <FormSection title="Thông tin sự cố">
              <AutocompleteField
                label="Số xe"
                required
                value={form.vehicleId}
                options={vehicleOptions}
                placeholder="Chọn số xe"
                searchPlaceholder="Tìm biển số..."
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

              <div className="space-y-1.5">
                <ModalFieldLabel>Khu vực</ModalFieldLabel>
                <div
                  className={cn(
                    MODAL_NATIVE_INPUT_CLASS,
                    "flex items-center bg-slate-50 text-slate-700"
                  )}
                  aria-label="Khu vực theo xe"
                >
                  {areaDisplay}
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <ModalFieldLabel required htmlFor="incident-location">
                  Địa điểm xảy ra tai nạn
                </ModalFieldLabel>
                <input
                  id="incident-location"
                  type="text"
                  className={cn(
                    MODAL_NATIVE_INPUT_CLASS,
                    showError("incidentLocation") &&
                      "border-red-400 focus:border-red-500 focus:ring-red-500/30"
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
                    showError("incidentDate") &&
                      "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                  )}
                  value={form.incidentDate}
                  onChange={(incidentDate) => patchForm({ incidentDate })}
                />
                {showError("incidentDate") ? (
                  <ModalFieldError message={errors.incidentDate} />
                ) : null}
              </div>

              <AutocompleteField
                label="Trạng thái"
                value={form.status}
                options={STATUS_ITEMS}
                placeholder="Chọn trạng thái"
                searchable={false}
                onChange={(status) => patchForm({ status: status as AccidentStatus })}
              />
            </FormSection>

            <FormSection title="Nội dung & nguyên nhân">
              <CreatableLookupField
                label="Đơn vị Bảo hiểm"
                value={form.insuranceCompany}
                options={insuranceOptions}
                placeholder="Chọn đơn vị bảo hiểm"
                onChange={(insuranceCompany) => patchForm({ insuranceCompany })}
                onOptionsChange={onInsuranceOptionsChange}
              />

              <div className="space-y-1.5">
                <ModalFieldLabel htmlFor="assessor">Giám định viên</ModalFieldLabel>
                <input
                  id="assessor"
                  type="text"
                  className={MODAL_NATIVE_INPUT_CLASS}
                  value={form.assessor}
                  placeholder="Nhập tên giám định viên"
                  onChange={(event) => patchForm({ assessor: event.target.value })}
                />
              </div>

              <CreatableLookupField
                label="Nguyên nhân"
                value={form.cause}
                options={causeOptions}
                placeholder="Chọn nguyên nhân"
                onChange={(cause) => patchForm({ cause })}
                onOptionsChange={onCauseOptionsChange}
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
            </FormSection>

            <FormSection title="Chi phí & thanh toán">
              <div className="space-y-1.5">
                <ModalFieldLabel>Ngày hoàn thành hồ sơ</ModalFieldLabel>
                <ViDatePicker
                  aria-label="Ngày hoàn thành hồ sơ"
                  className="w-full"
                  value={form.completionDate}
                  placeholder="Chọn ngày"
                  onChange={(completionDate) => patchForm({ completionDate })}
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

              <CreatableLookupField
                label="Hình thức bảo hiểm thanh toán"
                value={form.insurancePaymentMethod}
                options={paymentMethodOptions}
                placeholder="Chọn hình thức thanh toán"
                onChange={(insurancePaymentMethod) => patchForm({ insurancePaymentMethod })}
                onOptionsChange={onPaymentMethodOptionsChange}
              />

              <div className="space-y-1.5">
                <ModalFieldLabel>Ngày thanh toán</ModalFieldLabel>
                <ViDatePicker
                  aria-label="Ngày thanh toán"
                  className="w-full"
                  value={form.paymentDate}
                  placeholder="Chọn ngày"
                  onChange={(paymentDate) => patchForm({ paymentDate })}
                />
              </div>

              <CurrencyInput
                id="remaining-payment"
                label="Số tiền còn lại phải thanh toán"
                value={form.remainingPayment}
                onChange={(remainingPayment) => patchForm({ remainingPayment })}
                error={errors.remainingPayment}
                showError={showError("remainingPayment")}
              />
            </FormSection>

            <FormSection title="Bảo hiểm & thông tin khác">
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
            </FormSection>
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
    insurancePaymentMethod: "",
    paymentDate: "",
    remainingPayment: 0,
    tnds: "Không",
    materialDamage: "Không",
    vehicleStopDays: 0,
    notes: "",
  };
}

export function areaLabel(area: AreaCode): string {
  return AREA_LABEL_BY_CODE[area];
}
