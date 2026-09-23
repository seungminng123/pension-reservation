import {
  statusLabels,
  statusStyles,
  type FacilityStatus,
} from "@/utils/adminReservation";
export default function ReservationStatusBadge({
  status,
}: {
  status: FacilityStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      <span aria-hidden="true">{status === "AVAILABLE" ? "○" : "●"}</span>
      {statusLabels[status]}
    </span>
  );
}
export function ReservationStatusLegend() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="예약 상태 범례">
      {(["AVAILABLE", "PENDING", "CONFIRMED", "CANCEL_REQUESTED"] as const).map(
        (status) => (
          <ReservationStatusBadge key={status} status={status} />
        ),
      )}
    </div>
  );
}
