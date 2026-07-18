import { useCallback, useMemo, useState } from "react";
import { LuPlus, LuTriangleAlert } from "react-icons/lu";

import AccidentDetailView from "./components/AccidentDetailView";
import AccidentFilterCard from "./components/AccidentFilterCard";
import AccidentFormModal, {
  createEmptyAccidentForm,
  type AccidentEditSection,
  type AccidentFormValues,
} from "./components/AccidentFormModal";
import AccidentTable, { type AccidentStatusPatch } from "./components/AccidentTable";
import { FeaturePageShell, KpiCardsGrid, PageTitle, PrimaryButton } from "./components/ui";
import {
  DEFAULT_ACCIDENTS,
  MOCK_DRIVERS,
  MOCK_VEHICLES,
} from "./data/mockData";
import type { AccidentFilterState, AccidentRecord, AreaCode } from "./types";
import {
  DEFAULT_CAUSES,
  DEFAULT_INCIDENT_TYPES,
  DEFAULT_INFORMATION_SOURCES,
  DEFAULT_INSURANCE_COMPANIES,
  DEFAULT_INSURANCE_PAYMENT_METHODS,
  DEFAULT_REPORTING_DEPARTMENTS,
  DEFAULT_SEVERITIES,
} from "./types";
import { currentMonthDateRange } from "./utils/dateUtils";
import {
  buildActivityChanges,
  createActivityLogEntry,
  toComparableFormValues,
} from "./utils/activityUtils";

const defaultDateRange = currentMonthDateRange();
const SYSTEM_ACTOR_NAME = "Nguyễn Thị Hạnh";

function createId(prefix = "tn"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toFormValues(record: AccidentRecord): AccidentFormValues {
  const { id: _id, activityLogs: _logs, ...values } = record;
  return values;
}

export default function App() {
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
    severity: "all",
  });

  const [records, setRecords] = useState<AccidentRecord[]>(DEFAULT_ACCIDENTS);
  const [insuranceOptions, setInsuranceOptions] = useState<string[]>([...DEFAULT_INSURANCE_COMPANIES]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<string[]>([
    ...DEFAULT_INSURANCE_PAYMENT_METHODS,
  ]);
  const [causeOptions, setCauseOptions] = useState<string[]>([...DEFAULT_CAUSES]);
  const [informationSourceOptions, setInformationSourceOptions] = useState<string[]>([
    ...DEFAULT_INFORMATION_SOURCES,
  ]);
  const [reportingDepartmentOptions, setReportingDepartmentOptions] = useState<string[]>([
    ...DEFAULT_REPORTING_DEPARTMENTS,
  ]);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editSection, setEditSection] = useState<AccidentEditSection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<AccidentFormValues>(
    createEmptyAccidentForm(defaultDateRange.endDate)
  );

  const patchFilter = useCallback((patch: Partial<AccidentFilterState>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  const detailRecord = useMemo(
    () => (detailId ? records.find((row) => row.id === detailId) ?? null : null),
    [detailId, records]
  );

  const filteredRecords = useMemo(() => {
    const selectedDriver =
      filter.driverId !== "all"
        ? MOCK_DRIVERS.find((driver) => driver.id === filter.driverId)
        : undefined;

    return records.filter((row) => {
      if (row.incidentDate < filter.startDate || row.incidentDate > filter.endDate) {
        return false;
      }
      if (filter.areaId !== "all" && row.area !== filter.areaId) {
        return false;
      }
      if (filter.vehicleId !== "all" && row.vehicleId !== filter.vehicleId) {
        return false;
      }
      if (filter.receptionStatus !== "all" && row.receptionStatus !== filter.receptionStatus) {
        return false;
      }
      if (filter.processingStatus !== "all" && row.processingStatus !== filter.processingStatus) {
        return false;
      }
      if (filter.overallStatus !== "all" && row.overallStatus !== filter.overallStatus) {
        return false;
      }
      if (filter.incidentType !== "all" && row.incidentType !== filter.incidentType) {
        return false;
      }
      if (filter.severity !== "all" && row.severity !== filter.severity) {
        return false;
      }
      if (selectedDriver && row.driverName !== selectedDriver.name) {
        return false;
      }
      return true;
    });
  }, [filter, records]);

  const kpiItems = useMemo(() => {
    const pending = filteredRecords.filter((row) => row.processingStatus === "Chưa xử lý").length;
    const inProgress = filteredRecords.filter((row) => row.processingStatus === "Đang xử lý").length;
    const resolved = filteredRecords.filter((row) => row.processingStatus === "Đã xử lý").length;

    return [
      {
        key: "total",
        label: "Tổng sự cố",
        value: filteredRecords.length,
        icon: LuTriangleAlert,
        iconClass: "text-slate-500",
      },
      {
        key: "pending",
        label: "Chưa xử lý",
        value: pending,
        icon: LuTriangleAlert,
        valueClass: "text-amber-700",
        iconClass: "text-amber-500",
      },
      {
        key: "inProgress",
        label: "Đang xử lý",
        value: inProgress,
        icon: LuTriangleAlert,
        valueClass: "text-blue-700",
        iconClass: "text-blue-500",
      },
      {
        key: "resolved",
        label: "Đã xử lý",
        value: resolved,
        icon: LuTriangleAlert,
        valueClass: "text-emerald-700",
        iconClass: "text-emerald-500",
      },
    ];
  }, [filteredRecords]);

  const areaVehicles =
    filter.areaId === "all"
      ? MOCK_VEHICLES
      : MOCK_VEHICLES.filter((vehicle) => vehicle.area === (filter.areaId as AreaCode));

  const openCreateForm = () => {
    setFormMode("create");
    setEditSection(null);
    setEditingId(null);
    setFormInitialValues(createEmptyAccidentForm(filter.endDate));
    setFormOpen(true);
  };

  const openDetail = (record: AccidentRecord) => {
    setDetailId(record.id);
  };

  const openEditSection = (record: AccidentRecord, section: AccidentEditSection) => {
    setFormMode("edit");
    setEditSection(section);
    setEditingId(record.id);
    setFormInitialValues(toFormValues(record));
    setFormOpen(true);
  };

  const handleSubmit = (values: AccidentFormValues) => {
    if (formMode === "create") {
      setRecords((prev) => [
        {
          id: createId(),
          ...values,
          activityLogs: [createActivityLogEntry("CREATED", SYSTEM_ACTOR_NAME)],
        },
        ...prev,
      ]);
    } else if (editingId) {
      setRecords((prev) =>
        prev.map((row) => {
          if (row.id !== editingId) return row;
          const changes = buildActivityChanges(
            toComparableFormValues(row),
            toComparableFormValues({ ...row, ...values })
          );
          const nextLogs =
            changes.length > 0
              ? [createActivityLogEntry("UPDATED", SYSTEM_ACTOR_NAME, changes), ...row.activityLogs]
              : row.activityLogs;
          return {
            ...row,
            ...values,
            id: editingId,
            activityLogs: nextLogs,
          };
        })
      );
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((row) => row.id !== id));
    if (detailId === id) setDetailId(null);
  };

  const handleStatusChange = (id: string, patch: AccidentStatusPatch) => {
    setRecords((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        const changes = buildActivityChanges(
          toComparableFormValues(row),
          toComparableFormValues(next)
        );
        if (changes.length === 0) return row;
        return {
          ...next,
          activityLogs: [createActivityLogEntry("UPDATED", SYSTEM_ACTOR_NAME, changes), ...row.activityLogs],
        };
      })
    );
  };

  return (
    <FeaturePageShell>
      {detailRecord ? (
        <AccidentDetailView
          record={detailRecord}
          onBack={() => setDetailId(null)}
          onEdit={(section) => openEditSection(detailRecord, section)}
        />
      ) : (
        <>
          <PageTitle>Tai nạn sự cố của xe</PageTitle>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
              <div className="shrink-0 space-y-3">
                <AccidentFilterCard
                  filter={filter}
                  drivers={MOCK_DRIVERS}
                  vehicles={areaVehicles}
                  incidentTypeOptions={[...DEFAULT_INCIDENT_TYPES]}
                  severityOptions={[...DEFAULT_SEVERITIES]}
                  onChange={patchFilter}
                />

                <KpiCardsGrid items={kpiItems} />

                <div className="flex justify-end">
                  <PrimaryButton onClick={openCreateForm}>
                    <span className="inline-flex items-center gap-1.5">
                      <LuPlus className="h-4 w-4" aria-hidden />
                      Thêm tai nạn/sự cố
                    </span>
                  </PrimaryButton>
                </div>
              </div>

              <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                <AccidentTable
                  records={filteredRecords}
                  onViewDetail={openDetail}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          </section>
        </>
      )}

      <AccidentFormModal
        open={formOpen}
        mode={formMode}
        editSection={editSection}
        initialValues={formInitialValues}
        drivers={MOCK_DRIVERS}
        vehicles={MOCK_VEHICLES}
        insuranceOptions={insuranceOptions}
        paymentMethodOptions={paymentMethodOptions}
        causeOptions={causeOptions}
        informationSourceOptions={informationSourceOptions}
        reportingDepartmentOptions={reportingDepartmentOptions}
        onInsuranceOptionsChange={setInsuranceOptions}
        onPaymentMethodOptionsChange={setPaymentMethodOptions}
        onCauseOptionsChange={setCauseOptions}
        onInformationSourceOptionsChange={setInformationSourceOptions}
        onReportingDepartmentOptionsChange={setReportingDepartmentOptions}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </FeaturePageShell>
  );
}
