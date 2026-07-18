import { useMemo } from "react";

import type { AccidentFilterState, Driver, Vehicle } from "../types";
import { AREA_OPTIONS } from "../types";
import {
  FILTER_AREA_FIELD_CLASS,
  FILTER_BAR_LAYOUT_CLASS,
  FILTER_CONTENT_FIELD_CLASS,
  FILTER_DATE_FIELD_CLASS,
  FILTER_DRIVER_FIELD_CLASS,
  FILTER_STATUS_FIELD_CLASS,
  FILTER_VEHICLE_FIELD_CLASS,
} from "../styles/fieldStyles";
import FilterAutocomplete from "./FilterAutocomplete";
import { Card, CardContent, DatePickerInput, FilterField } from "./ui";

type AccidentFilterCardProps = {
  filter: AccidentFilterState;
  drivers: Driver[];
  vehicles: Vehicle[];
  incidentTypeOptions: string[];
  severityOptions: string[];
  onChange: (patch: Partial<AccidentFilterState>) => void;
};

export default function AccidentFilterCard({
  filter,
  drivers,
  vehicles,
  incidentTypeOptions,
  severityOptions,
  onChange,
}: AccidentFilterCardProps) {
  const areaOptions = useMemo(
    () => AREA_OPTIONS.map((item) => ({ id: item.id, label: item.label })),
    []
  );

  const driverOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả tài xế" },
      ...drivers.map((driver) => ({ id: driver.id, label: driver.name })),
    ],
    [drivers]
  );

  const vehicleOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả xe" },
      ...vehicles.map((vehicle) => ({ id: vehicle.id, label: vehicle.plateNumber })),
    ],
    [vehicles]
  );

  const receptionOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả tiếp nhận" },
      { id: "Chưa tiếp nhận", label: "Chưa tiếp nhận" },
      { id: "Đã tiếp nhận", label: "Đã tiếp nhận" },
    ],
    []
  );

  const processingOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả xử lý" },
      { id: "Chưa xử lý", label: "Chưa xử lý" },
      { id: "Đang xử lý", label: "Đang xử lý" },
      { id: "Đã xử lý", label: "Đã xử lý" },
    ],
    []
  );

  const overallOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả tổng thể" },
      { id: "Đang theo dõi", label: "Đang theo dõi" },
      { id: "Đóng", label: "Đóng" },
    ],
    []
  );

  const typeOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả loại" },
      ...incidentTypeOptions.map((item) => ({ id: item, label: item })),
    ],
    [incidentTypeOptions]
  );

  const severityFilterOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả mức độ" },
      ...severityOptions.map((item) => ({ id: item, label: item })),
    ],
    [severityOptions]
  );

  return (
    <Card>
      <CardContent>
        <div className={FILTER_BAR_LAYOUT_CLASS}>
          <DatePickerInput
            label="Từ ngày"
            className={FILTER_DATE_FIELD_CLASS}
            value={filter.startDate}
            max={filter.endDate}
            onChange={(startDate) => onChange({ startDate })}
          />
          <DatePickerInput
            label="Đến ngày"
            className={FILTER_DATE_FIELD_CLASS}
            value={filter.endDate}
            min={filter.startDate}
            onChange={(endDate) => onChange({ endDate })}
          />
          <FilterField label="Khu vực" className={FILTER_AREA_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Khu vực"
              value={filter.areaId}
              options={areaOptions}
              placeholder="Tất cả khu vực"
              searchable={false}
              onChange={(areaId) =>
                onChange({
                  areaId: areaId as AccidentFilterState["areaId"],
                  vehicleId: "all",
                })
              }
            />
          </FilterField>
          <FilterField label="Tài xế" className={FILTER_DRIVER_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Tài xế"
              value={filter.driverId}
              options={driverOptions}
              placeholder="Tất cả tài xế"
              searchPlaceholder="Tìm tài xế..."
              onChange={(driverId) => onChange({ driverId })}
            />
          </FilterField>
          <FilterField label="Số xe" className={FILTER_VEHICLE_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Số xe"
              value={filter.vehicleId}
              options={vehicleOptions}
              placeholder="Tất cả xe"
              searchPlaceholder="Tìm biển số..."
              onChange={(vehicleId) => onChange({ vehicleId })}
            />
          </FilterField>
          <FilterField label="Loại sự cố" className={FILTER_CONTENT_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Loại sự cố"
              value={filter.incidentType}
              options={typeOptions}
              placeholder="Tất cả loại"
              searchable={false}
              onChange={(incidentType) => onChange({ incidentType })}
            />
          </FilterField>
          <FilterField label="Mức độ" className={FILTER_STATUS_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Mức độ sự cố"
              value={filter.severity}
              options={severityFilterOptions}
              placeholder="Tất cả mức độ"
              searchable={false}
              onChange={(severity) => onChange({ severity })}
            />
          </FilterField>
          <FilterField label="Tiếp nhận" className={FILTER_STATUS_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Trạng thái tiếp nhận"
              value={filter.receptionStatus}
              options={receptionOptions}
              placeholder="Tất cả tiếp nhận"
              searchable={false}
              onChange={(receptionStatus) =>
                onChange({
                  receptionStatus: receptionStatus as AccidentFilterState["receptionStatus"],
                })
              }
            />
          </FilterField>
          <FilterField label="Xử lý" className={FILTER_STATUS_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Trạng thái xử lý"
              value={filter.processingStatus}
              options={processingOptions}
              placeholder="Tất cả xử lý"
              searchable={false}
              onChange={(processingStatus) =>
                onChange({
                  processingStatus: processingStatus as AccidentFilterState["processingStatus"],
                })
              }
            />
          </FilterField>
          <FilterField label="Tổng thể" className={FILTER_STATUS_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Trạng thái tổng thể"
              value={filter.overallStatus}
              options={overallOptions}
              placeholder="Tất cả tổng thể"
              searchable={false}
              onChange={(overallStatus) =>
                onChange({
                  overallStatus: overallStatus as AccidentFilterState["overallStatus"],
                })
              }
            />
          </FilterField>
        </div>
      </CardContent>
    </Card>
  );
}
