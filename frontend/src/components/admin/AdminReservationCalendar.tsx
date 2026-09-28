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
import { facilityState } from "@/utils/adminReservation";
import ReservationStatusBadge, {
  ReservationStatusLegend,
} from "@/components/admin/ReservationStatusBadge";
import { LoadingRows, QueryError } from "@/components/admin/QueryFeedback";
import { formatDate, monthDates } from "@/utils/date";
export default function AdminReservationCalendar({
  onSelect,
  initialDate,
}: {
  initialDate?: string;
  onSelect: (id: number) => void;
}) {
  const [month, setMonth] = useState(() => {
    const initial = initialDate
      ? new Date(`${initialDate}T00:00:00`)
      : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const [date, setDate] = useState(initialDate ?? formatDate(new Date()));
  const today = formatDate(new Date());
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:gap-y-3">
        <div className="min-w-0 max-sm:[&_button]:h-8 max-sm:[&_button]:w-8 max-sm:[&_h3]:text-sm sm:col-span-2">
          <MonthNavigation
            month={month}
            onChange={(next) => {
              setSelectedFacility(null);
              setMonth(next);
              setDate(formatDate(next));
            }}
          />
        </div>
        <div
          className="order-3 col-span-2 flex flex-wrap gap-3 text-xs sm:order-2 sm:col-span-1 sm:text-sm"
          aria-label="월간 예약 상태 범례: 첫 번째 숫자는 확정, 두 번째 숫자는 대기"
        >
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="text-green-700">
              ●
            </span>
            <span className="sm:hidden">확정</span>
            <span className="hidden sm:inline">예약 확정</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="text-yellow-700">
              ●
            </span>
            <span className="sm:hidden">대기</span>
            <span className="hidden sm:inline">입금 확인 대기</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
            setDate(formatDate(now));
            setSelectedFacility(null);
          }}
          className="order-2 min-h-8 rounded-md border border-slate-300 px-2 text-xs sm:order-3 sm:min-h-11 sm:rounded-lg sm:px-3 sm:text-sm"
        >
          오늘
        </button>
      </div>
      {calendar.isLoading ? (
        <LoadingRows />
      ) : calendar.isError ? (
        <QueryError onRetry={() => void calendar.refetch()} />
      ) : (
        <div className="mt-3 sm:mt-4">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span
                key={day}
                className="py-2 text-center text-xs text-slate-500"
              >
                {day}
              </span>
            ))}
            {Array.from({ length: month.getDay() }, (_, i) => (
              <div key={i} />
            ))}
            {monthDates(month).map((day) => {
              const summary = days.get(day);
              const roomConfirmed = summary?.roomConfirmedCount ?? 0;
              const roomPending = summary?.roomPendingCount ?? 0;
              const pyeongsangConfirmed =
                summary?.pyeongsangConfirmedCount ?? 0;
              const pyeongsangPending = summary?.pyeongsangPendingCount ?? 0;
              const hasRoomReservation = roomConfirmed > 0 || roomPending > 0;
              const hasPyeongsangReservation =
                pyeongsangConfirmed > 0 || pyeongsangPending > 0;
              const counts = [
                {
                  label: "방",
                  pending: roomPending,
                  confirmed: roomConfirmed,
                  visibleOnMobile: hasRoomReservation,
                },
                {
                  label: "평상",
                  pending: pyeongsangPending,
                  confirmed: pyeongsangConfirmed,
                  visibleOnMobile: hasPyeongsangReservation,
                },
              ];
              return (
                <button
                  key={day}
                  type="button"
                  aria-label={`${day}${day === today ? ", 오늘" : ""}, ${counts.map(({ label, confirmed, pending }) => `${label} 확정 ${confirmed}건 / 대기 ${pending}건`).join(", ")}`}
                  aria-current={day === today ? "date" : undefined}
                  aria-pressed={date === day}
                  onClick={() => {
                    setDate(day);
                    setSelectedFacility(null);
                  }}
                  className={`flex min-h-10 min-w-0 flex-col items-stretch rounded-md border px-[3px] py-1 text-center sm:block sm:min-h-28 sm:px-2 sm:py-3 ${date === day ? "border-slate-900 bg-slate-100" : "border-transparent sm:border-slate-100"}`}
                >
                  <span
                    className={
                      "mx-auto inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm " +
                      (day === today ? "bg-slate-900 text-white" : "")
                    }
                  >
                    {Number(day.slice(-2))}
                  </span>
                  <span
                    className={`${hasRoomReservation || hasPyeongsangReservation ? "block" : "hidden sm:block"} mt-1 text-[10px] leading-3 tabular-nums sm:mt-2 sm:space-y-1 sm:text-sm sm:leading-5`}
                  >
                    {counts.map(
                      ({ label, confirmed, pending, visibleOnMobile }) => (
                        <span
                          key={label}
                          className={`${visibleOnMobile ? "block" : "hidden"} text-slate-600 sm:block sm:whitespace-nowrap sm:text-inherit`}
                        >
                          <span className="block text-[9px] leading-3 tracking-tight [overflow-wrap:anywhere] sm:hidden">
                            <span className="inline-block max-w-full">
                              {label}{" "}
                              <span
                                className={`inline-block max-w-full ${
                                  confirmed
                                    ? "font-semibold text-green-700"
                                    : "text-slate-500"
                                }`}
                              >
                                {confirmed}예약
                              </span>
                            </span>{" "}
                            {pending > 0 && (
                              <span className="inline-block max-w-full">
                                (
                                <span
                                  className={
                                    pending
                                      ? "font-semibold text-yellow-700"
                                      : "text-slate-500"
                                  }
                                >
                                  {pending}대기
                                </span>
                                )
                              </span>
                            )}
                          </span>
                          <span className="hidden sm:inline">
                            <span className="hidden sm:inline">{label} </span>
                            <span
                              className={
                                confirmed
                                  ? "font-semibold text-green-700"
                                  : "text-slate-500"
                              }
                            >
                              {confirmed}
                            </span>
                            <span className="hidden sm:inline">{" / "}</span>
                            <span
                              className={
                                pending
                                  ? "font-semibold text-yellow-700"
                                  : "text-slate-500"
                              }
                            >
                              <span className="hidden sm:inline">대기 </span>
                              {pending}
                            </span>
                          </span>
                        </span>
                      ),
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <h3 className="mt-3 border-t border-slate-200 pt-3 text-sm font-semibold sm:mt-5 sm:pt-4 sm:text-base">
        <span className="sm:hidden">
          {Number(date.slice(5, 7))}월 {Number(date.slice(8, 10))}일 예약 현황
        </span>
        <span className="hidden sm:inline">{date} 예약</span>
      </h3>
      <div className="mt-3 hidden sm:block">
        <ReservationStatusLegend />
      </div>
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
        <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
          <AdminReservationNumberGrid
            compactMobile
            title="방"
            items={units.filter((unit) => unit.type === "ROOM")}
            onSelect={selectFacility}
          />
          <AdminReservationNumberGrid
            compactMobile
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
        <p className="hidden py-5 text-sm text-slate-500 sm:block">
          해당 날짜에는 예약이 없습니다.
        </p>
      )}
    </section>
  );
}
