import type { ReservationStatus } from "@/types/reservation";
import type { AdminReservationCalendarItem, AdminRoom } from "@/types/admin";
export type FacilityStatus = ReservationStatus | "AVAILABLE" | "CLOSED";
export const statusLabels: Record<FacilityStatus, string> = {
  AVAILABLE: "예약 가능",
  PENDING: "입금 확인 대기",
  CONFIRMED: "예약 확정",
  CANCEL_REQUESTED: "취소 요청",
  CANCELED: "취소 완료",
  CLOSED: "판매 중지",
};
export const statusStyles: Record<FacilityStatus, string> = {
  AVAILABLE: "border-slate-300 bg-white text-slate-700",
  PENDING: "border-yellow-300 bg-yellow-100 text-yellow-950",
  CONFIRMED: "border-green-700 bg-green-700 text-white",
  CANCEL_REQUESTED: "border-red-300 bg-red-50 text-red-800",
  CANCELED: "border-slate-200 bg-slate-100 text-slate-500",
  CLOSED: "border-slate-300 bg-slate-100 text-slate-500",
};
export function facilityState(
  room: AdminRoom,
  reservations: AdminReservationCalendarItem[],
) {
  const items = reservations.filter(
    (item) => item.roomId === room.roomId && item.status !== "CANCELED",
  );
  const remaining = room.saleEnabled
    ? Math.max(
        0,
        room.stockCount - items.reduce((sum, item) => sum + item.quantity, 0),
      )
    : 0;
  const status: FacilityStatus = items.some(
    (item) => item.status === "CANCEL_REQUESTED",
  )
    ? "CANCEL_REQUESTED"
    : items.some((item) => item.status === "PENDING")
      ? "PENDING"
      : items.length
        ? "CONFIRMED"
        : room.saleEnabled && remaining > 0
          ? "AVAILABLE"
          : "CLOSED";
  return { items, remaining, status };
}
export const scheduleLabel = (
  type: string,
  checkIn: string,
  checkOut: string,
) =>
  type === "PYEONGSANG" ? `${checkIn} · 하루 이용` : `${checkIn} ~ ${checkOut}`;
export const shiftDate = (value: string, amount: number) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
