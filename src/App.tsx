import { useCallback, useMemo, useState } from "react";
import { LuPlus, LuTriangleAlert } from "react-icons/lu";

import AccidentFilterCard from "./components/AccidentFilterCard";
import AccidentFormModal, {
  createEmptyAccidentForm,
  type AccidentFormValues,
} from "./components/AccidentFormModal";
import AccidentTable from "./components/AccidentTable";
import { FeaturePageShell, KpiCardsGrid, PageTitle, PrimaryButton } from "./components/ui";
import {
  DEFAULT_ACCIDENTS,
  MOCK_DRIVERS,
  MOCK_VEHICLES,
} from "./data/mockData";
import type { AccidentFilterState, AccidentRecord, AreaCode } from "./types";
import {
  DEFAULT_ASSESSORS,
  DEFAULT_INSURANCE_COMPANIES,
} from "./types";
import { currentMonthDateRange } from "./utils/dateUtils";

const defaultDateRange = currentMonthDateRange();

function createId(): string {
  return `tn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  const [filter, setFilter] = useState<AccidentFilterState>({
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
    areaId: "all",
    driverId: "all",
    vehicleId: "all",
    status: "all",
  });

  const [records, setRecords] = useState<AccidentRecord[]>(DEFAULT_ACCIDENTS);
  const [insuranceOptions, setInsuranceOptions] = useState<string[]>([...DEFAULT_INSURANCE_COMPANIES]);
  const [assessorOptions, setAssessorOptions] = useState<string[]>([...DEFAULT_ASSESSORS]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<AccidentFormValues>(
    createEmptyAccidentForm(defaultDateRange.endDate)
  );

  const patchFilter = useCallback((patch: Partial<AccidentFilterState>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

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
      if (filter.status !== "all" && row.status !== filter.status) {
        return false;
      }
      if (selectedDriver && row.driverName !== selectedDriver.name) {
        return false;
      }
      return true;
    });
  }, [filter, records]);

  const kpiItems = useMemo(() => {
    const pending = filteredRecords.filter((row) => row.status === "Chưa xử lý").length;
    const tracking = filteredRecords.filter((row) => row.status === "Theo dõi").length;
    const resolved = filteredRecords.filter((row) => row.status === "Đã xử lý").length;

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
        key: "tracking",
        label: "Theo dõi",
        value: tracking,
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
    setEditingId(null);
    setFormInitialValues(createEmptyAccidentForm(filter.endDate));
    setFormOpen(true);
  };

  const openEditForm = (record: AccidentRecord) => {
    setFormMode("edit");
    setEditingId(record.id);
    setFormInitialValues({
      status: record.status,
      area: record.area,
      vehicleId: record.vehicleId,
      driverName: record.driverName,
      incidentLocation: record.incidentLocation,
      incidentDate: record.incidentDate,
      insuranceCompany: record.insuranceCompany,
      assessor: record.assessor,
      description: record.description,
      cause: record.cause,
      detailType: record.detailType,
      timeOfDay: record.timeOfDay,
      completionDate: record.completionDate,
      totalLoss: record.totalLoss,
      insurancePay: record.insurancePay,
      driverPay: record.driverPay,
      companyShare: record.companyShare,
      paymentDate: record.paymentDate,
      tnds: record.tnds,
      materialDamage: record.materialDamage,
      vehicleStopDays: record.vehicleStopDays,
      notes: record.notes,
    });
    setFormOpen(true);
  };

  const handleSubmit = (values: AccidentFormValues) => {
    if (formMode === "create") {
      setRecords((prev) => [{ id: createId(), ...values }, ...prev]);
    } else if (editingId) {
      setRecords((prev) =>
        prev.map((row) => (row.id === editingId ? { id: editingId, ...values } : row))
      );
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <FeaturePageShell>
      <PageTitle>Tai nạn sự cố của xe</PageTitle>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4">
          <div className="space-y-3">
            <AccidentFilterCard
              filter={filter}
              drivers={MOCK_DRIVERS}
              vehicles={areaVehicles}
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

            <AccidentTable records={filteredRecords} onEdit={openEditForm} onDelete={handleDelete} />
          </div>
        </div>
      </section>

      <AccidentFormModal
        open={formOpen}
        mode={formMode}
        initialValues={formInitialValues}
        drivers={MOCK_DRIVERS}
        vehicles={MOCK_VEHICLES}
        insuranceOptions={insuranceOptions}
        assessorOptions={assessorOptions}
        onInsuranceOptionsChange={setInsuranceOptions}
        onAssessorOptionsChange={setAssessorOptions}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </FeaturePageShell>
  );
}
