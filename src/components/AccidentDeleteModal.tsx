import { useId } from "react";

import type { AccidentRecord } from "../types";
import { AREA_LABEL_BY_CODE } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatViDate } from "../utils/dateUtils";
import ModalButton from "./modal/ModalButton";
import ModalFooter from "./modal/ModalFooter";
import ModalHeader from "./modal/ModalHeader";
import { cn } from "./ui";
import { MODAL_BODY_CLASS, MODAL_CONTAINER_CLASS } from "../styles/modalStyles";

type AccidentDeleteModalProps = {
  open: boolean;
  record: AccidentRecord | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AccidentDeleteModal({
  open,
  record,
  onClose,
  onConfirm,
}: AccidentDeleteModalProps) {
  const titleId = useId();

  if (!open) return null;

  const vehiclePlate = record ? getVehicleById(record.vehicleId)?.plateNumber : undefined;

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
        className={cn(MODAL_CONTAINER_CLASS, "max-w-md")}
        onClick={(event) => event.stopPropagation()}
      >
        <ModalHeader titleId={titleId} title="Xác nhận xóa" onClose={onClose} />

        <div className={MODAL_BODY_CLASS}>
          <p className="text-sm text-slate-600">
            {record ? (
              <>
                Bạn có chắc muốn xóa bản ghi tai nạn/sự cố của tài xế{" "}
                <span className="font-semibold text-slate-900">{record.driverName}</span>, xe{" "}
                <span className="font-semibold text-slate-900">{vehiclePlate ?? "—"}</span> ngày{" "}
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatViDate(record.incidentDate)}
                </span>
                ? Thao tác không thể hoàn tác.
              </>
            ) : (
              <>Bạn có chắc muốn xóa bản ghi tai nạn/sự cố này? Thao tác không thể hoàn tác.</>
            )}
          </p>
        </div>

        <ModalFooter>
          <ModalButton variant="cancel" showIcon={false} onClick={onClose}>
            Hủy
          </ModalButton>
          <ModalButton variant="danger" showIcon={false} onClick={onConfirm}>
            Xóa
          </ModalButton>
        </ModalFooter>
      </div>
    </div>
  );
}

export function accidentSummary(record: AccidentRecord): string {
  const area = AREA_LABEL_BY_CODE[record.area];
  const plate = getVehicleById(record.vehicleId)?.plateNumber ?? "—";
  return `${record.driverName} · ${plate} · ${area}`;
}
