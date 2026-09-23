import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminReservationCalendar,
  getAdminReservationsByDate,
  getAdminRooms,
} from "@/api/admin";
import MonthNavigation from "@/components/common/MonthNavigation";
import AdminReservationNumberGrid from "@/components/admin/AdminReservationNumberGrid";
import Modal from "@/components/common/Modal";
import { facilityState, statusStyles } from "@/utils/adminReservation";
import ReservationStatusBadge, {
  ReservationStatusLegend,
} from "@/components/admin/ReservationStatusBadge";
import { LoadingRows, QueryError } from "@/components/admin/QueryFeedback";
import { formatDate, monthDates } from "@/utils/date";
export default function AdminReservationCalendar({
  onSelect,
}: {
  onSelect: (id: number) => void;
}) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [date, setDate] = useState(formatDate(new Date()));
  const year = month.getFullYear();
  const monthNumber = month.getMonth() + 1;
  const calendar = useQuery({
    queryKey: ["adminReservationCalendar", year, monthNumber],
    queryFn: () => getAdminReservationCalendar(year, monthNumber),
  });
  const reservations = useQuery({
    queryKey: ["adminReservationsByDate", date],
    queryFn: () => getAdminReservationsByDate(date),
  });
  const rooms = useQuery({ queryKey: ["adminRooms"], queryFn: getAdminRooms });
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const units = (rooms.data ?? []).map((room) => {
    const state = facilityState(room, reservations.data ?? []);
    return { ...room, ...state, reservationCount: state.items.length };
  });
  const chosen = units.find((unit) => unit.roomId === selectedFacility);
  const selectFacility = (id: number) => {
    const unit = units.find((item) => item.roomId === id);
    if (unit?.items.length === 1) onSelect(unit.items[0].reservationId);
    else setSelectedFacility(id);
  };
  const days = new Map(calendar.data?.map((day) => [day.date, day]));
  return (
    <section
      className="rounded-lg border border-slate-200 bg-white p-3 sm:p-5"
      aria-label="월간 예약 현황"
    >
      <MonthNavigation
        month={month}
        onChange={(next) => {
          setMonth(next);
          setDate(formatDate(next));
        }}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <ReservationStatusLegend />
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
            setDate(formatDate(now));
            setSelectedFacility(null);
          }}
          className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
        >
          오늘
        </button>
      </div>
      {calendar.isLoading ? (
        <LoadingRows />
      ) : calendar.isError ? (
        <QueryError onRetry={() => void calendar.refetch()} />
      ) : (
        <div className="mt-4 grid grid-cols-7 gap-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <span key={day} className="py-2 text-center text-xs text-slate-500">
              {day}
            </span>
          ))}
          {Array.from({ length: month.getDay() }, (_, i) => (
            <div key={i} />
          ))}
          {monthDates(month).map((day) => {
            const summary = days.get(day);
            return (
              <button
                key={day}
                type="button"
                aria-label={`${day}, 예약 ${summary?.reservationCount ?? 0}건, 대기 ${summary?.pendingCount ?? 0}건, 확정 ${summary?.confirmedCount ?? 0}건`}
                aria-pressed={date === day}
                onClick={() => {
                  setDate(day);
                  setSelectedFacility(null);
                }}
                className={`min-h-20 min-w-0 rounded-md border px-0.5 py-2 text-center ${date === day ? "border-slate-900 bg-slate-100" : "border-slate-100"}`}
              >
                <span className="text-sm font-semibold">
                  {Number(day.slice(-2))}
                </span>
                <span className="mt-1 block text-[10px] sm:text-xs">
                  예약 {summary?.reservationCount ?? 0}건
                </span>
                <span className="block text-[10px] text-slate-500 sm:text-xs">
                  수량 {summary?.reservedQuantity ?? 0}개
                </span>
                <span
                  className={
                    "mt-1 block rounded border text-[9px] sm:text-xs " +
                    (summary?.pendingCount
                      ? statusStyles.PENDING
                      : "border-slate-100 bg-white text-slate-400")
                  }
                >
                  대기 {summary?.pendingCount ?? 0}
                </span>
                <span
                  className={
                    "mt-1 block rounded border text-[9px] sm:text-xs " +
                    (summary?.confirmedCount
                      ? statusStyles.CONFIRMED
                      : "border-slate-100 bg-white text-slate-400")
                  }
                >
                  확정 {summary?.confirmedCount ?? 0}
                </span>
                {!!summary?.cancelRequestedCount && (
                  <span className="mt-1 block text-[9px] text-red-700">
                    취소요청 {summary.cancelRequestedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <h3 className="mt-5 border-t border-slate-200 pt-4 font-semibold">
        {date} 예약
      </h3>
      {reservations.isLoading || rooms.isLoading ? (
        <LoadingRows />
      ) : reservations.isError || rooms.isError ? (
        <QueryError
          onRetry={() => {
            void reservations.refetch();
            void rooms.refetch();
          }}
        />
      ) : (
        <div className="mt-4 space-y-4">
          <AdminReservationNumberGrid
            title="방"
            items={units.filter((unit) => unit.type === "ROOM")}
            onSelect={selectFacility}
          />
          <AdminReservationNumberGrid
            title="평상"
            items={units.filter((unit) => unit.type === "PYEONGSANG")}
            onSelect={selectFacility}
          />
        </div>
      )}
      {chosen && (
        <Modal title={chosen.name} onClose={() => setSelectedFacility(null)}>
          {chosen.items.length ? (
            <div className="space-y-2">
              {chosen.items.map((item) => (
                <button
                  key={item.reservationId}
                  type="button"
                  onClick={() => {
                    setSelectedFacility(null);
                    onSelect(item.reservationId);
                  }}
                  className="flex w-full flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <span>
                    {item.guestName} · {item.quantity}개
                  </span>
                  <ReservationStatusBadge status={item.status} />
                </button>
              ))}
            </div>
          ) : (
            <ReservationStatusBadge status={chosen.status} />
          )}
        </Modal>
      )}
      {reservations.isLoading ? (
        <LoadingRows />
      ) : reservations.isError ? (
        <QueryError onRetry={() => void reservations.refetch()} />
      ) : reservations.data?.length ? (
        <div className="mt-3 divide-y divide-slate-100">
          {reservations.data.map((item) => (
            <button
              key={item.reservationId}
              onClick={() => onSelect(item.reservationId)}
              className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left text-sm"
            >
              <span>
                {item.roomName} · {item.guestName} · {item.quantity}개
              </span>
              <ReservationStatusBadge status={item.status} />
            </button>
          ))}
        </div>
      ) : (
        <p className="py-5 text-sm text-slate-500">
          해당 날짜에는 예약이 없습니다.
        </p>
      )}
    </section>
  );
}
