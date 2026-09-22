import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminReservationCalendar,
  getAdminReservationsByDate,
} from "@/api/admin";
import MonthNavigation from "@/components/common/MonthNavigation";
import { formatDate, monthDates } from "@/utils/date";
import type { ReservationStatus } from "@/types/reservation";
const labels: Record<ReservationStatus, string> = {
  PENDING: "입금 확인 대기",
  CONFIRMED: "예약 확정",
  CANCEL_REQUESTED: "취소 요청",
  CANCELED: "취소 완료",
};
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
  const days = new Map(calendar.data?.map((day) => [day.date, day]));
  return (
    <section className="mt-6 rounded-2xl border bg-white p-2 sm:p-5">
      <h3 className="mb-4 px-2 text-xl font-bold">예약 현황</h3>
      <MonthNavigation
        month={month}
        onChange={(next) => {
          setMonth(next);
          setDate(formatDate(next));
        }}
      />
      {calendar.isLoading ? (
        <p className="p-5" role="status">
          예약 현황을 불러오는 중입니다.
        </p>
      ) : calendar.isError ? (
        <p className="p-5 text-red-500" role="alert">
          예약 현황을 불러오지 못했습니다.{" "}
          <button onClick={() => void calendar.refetch()} className="underline">
            다시 시도
          </button>
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-7 gap-0.5 sm:gap-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <span key={day} className="py-2 text-center text-xs text-gray-500">
              {day}
            </span>
          ))}
          {Array.from({ length: month.getDay() }, (_, index) => (
            <div key={index} />
          ))}
          {monthDates(month).map((day) => {
            const summary = days.get(day);
            return (
              <button
                key={day}
                type="button"
                aria-label={`${day}, 예약 ${summary?.reservationCount ?? 0}건, 수량 ${summary?.reservedQuantity ?? 0}개`}
                aria-pressed={date === day}
                onClick={() => setDate(day)}
                className={`min-h-24 min-w-0 rounded-lg border px-0.5 py-2 text-center sm:rounded-xl sm:px-1 ${date === day ? "border-black bg-gray-100" : "border-gray-100 hover:bg-gray-50"}`}
              >
                <span className="text-sm font-semibold">
                  {Number(day.slice(-2))}
                </span>
                <span className="mt-1 block text-[9px] sm:text-xs">
                  예약 {summary?.reservationCount ?? 0}건
                </span>
                <span className="block text-[9px] text-gray-500 sm:text-xs">
                  수량 {summary?.reservedQuantity ?? 0}개
                </span>
                {summary && (
                  <span className="mt-1 hidden text-[10px] text-gray-500 lg:block">
                    대기 {summary.pendingCount}
                    <br />
                    확정 {summary.confirmedCount}
                    <br />
                    취소요청 {summary.cancelRequestedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-6 border-t px-2 pt-5">
        <h3 className="font-bold">{date} 예약</h3>
        {reservations.isLoading ? (
          <p className="py-4" role="status">
            예약을 불러오는 중입니다.
          </p>
        ) : reservations.isError ? (
          <p className="py-4 text-red-500" role="alert">
            예약을 불러오지 못했습니다.{" "}
            <button
              onClick={() => void reservations.refetch()}
              className="underline"
            >
              다시 시도
            </button>
          </p>
        ) : (
          (["ROOM", "PYEONGSANG"] as const).map((type) => {
            const items =
              reservations.data?.filter((item) => item.roomType === type) ?? [];
            return (
              <section key={type} className="mt-4">
                <h4 className="mb-2 font-semibold">
                  {type === "ROOM" ? "방" : "평상"}
                </h4>
                {items.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((item) => (
                      <button
                        key={item.reservationId}
                        type="button"
                        onClick={() => onSelect(item.reservationId)}
                        className="min-w-0 space-y-1 rounded-xl border p-4 text-left hover:bg-gray-50"
                      >
                        <p className="font-semibold">{item.roomName}</p>
                        <p className="text-sm">
                          {item.guestName} · {item.quantity}개
                        </p>
                        <p className="text-sm text-gray-500">
                          {labels[item.status]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.checkIn} ~ {item.checkOut}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-sm text-gray-500">
                    예약 내역이 없습니다.
                  </p>
                )}
              </section>
            );
          })
        )}
      </div>
    </section>
  );
}
