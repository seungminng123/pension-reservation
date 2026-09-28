import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminReservationCalendar from "@/components/admin/AdminReservationCalendar";
import ReservationDetailDrawer from "@/components/admin/ReservationDetailDrawer";
import { isValidDate } from "@/utils/date";
export default function AdminReservationsPage() {
  const [params] = useSearchParams();
  const date = params.get("date") ?? "";
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="space-y-3 sm:space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">예약 관리</h2>
        <p className="mt-1 hidden text-sm text-slate-500 sm:block">
          월간 예약 현황을 확인하고 날짜를 선택해 예약을 관리하세요.
        </p>
      </div>
      <AdminReservationCalendar
        key={date}
        initialDate={isValidDate(date) ? date : undefined}
        onSelect={setSelected}
      />
      {selected !== null && (
        <ReservationDetailDrawer
          key={selected}
          reservationId={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
