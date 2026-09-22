import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getAdminReservationCalendar,
  getAdminReservationsByDate,
} from "@/api/admin";

import MonthNavigation from "@/components/common/MonthNavigation";

import { formatDate, monthDates } from "@/utils/date";

import type { ReservationStatus } from "@/types/reservation";

const statusLabels: Record<ReservationStatus, string> = {
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

  const roomReservations =
    reservations.data?.filter((item) => item.roomType === "ROOM") ?? [];

  const pyeongsangReservations =
    reservations.data?.filter((item) => item.roomType === "PYEONGSANG") ?? [];

  const renderReservationItems = (
    items: typeof roomReservations,
    type: "ROOM" | "PYEONGSANG",
  ) => {
    if (!items.length) {
      return null;
    }

    return (
      <section className="mt-5">
        <h4 className="mb-3 font-bold">{type === "ROOM" ? "방" : "평상"}</h4>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <button
              key={item.reservationId}
              type="button"
              onClick={() => onSelect(item.reservationId)}
              className="min-w-0 rounded-xl border p-4 text-left transition hover:border-black hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{item.roomName}</p>

                  <p className="mt-1 text-sm text-gray-600">
                    {item.guestName} · {item.quantity}개
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs">
                  {statusLabels[item.status]}
                </span>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                {type === "PYEONGSANG"
                  ? `${item.checkIn} · 하루 이용`
                  : `${item.checkIn} ~ ${item.checkOut}`}
              </p>
            </button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <section className="rounded-2xl border bg-white p-3 sm:p-5">
      <div className="mb-5">
        <h3 className="text-xl font-bold">예약 현황</h3>

        <p className="mt-1 text-sm text-gray-500">
          날짜를 선택하면 해당 날짜의 예약을 확인할 수 있습니다.
        </p>
      </div>

      <MonthNavigation
        month={month}
        onChange={(nextMonth) => {
          setMonth(nextMonth);

          setDate(formatDate(nextMonth));
        }}
      />

      {calendar.isLoading ? (
        <p className="p-5 text-center text-sm text-gray-500" role="status">
          예약 현황을 불러오는 중입니다.
        </p>
      ) : calendar.isError ? (
        <div className="p-5 text-center" role="alert">
          <p className="text-sm text-red-500">
            예약 현황을 불러오지 못했습니다.
          </p>

          <button
            type="button"
            onClick={() => void calendar.refetch()}
            className="mt-2 text-sm underline"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-7 gap-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <span key={day} className="py-2 text-center text-xs text-gray-500">
              {day}
            </span>
          ))}

          {Array.from(
            {
              length: month.getDay(),
            },
            (_, index) => (
              <div key={index} />
            ),
          )}

          {monthDates(month).map((day) => {
            const summary = days.get(day);

            const isSelected = date === day;

            return (
              <button
                key={day}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setDate(day)}
                className={`min-h-20 min-w-0 rounded-lg border px-1 py-2 text-center transition sm:min-h-24 sm:rounded-xl ${
                  isSelected
                    ? "border-black bg-gray-100"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <span className="text-sm font-semibold">
                  {Number(day.slice(-2))}
                </span>

                {/* 예약 있는 날만 표시 */}
                {summary && (
                  <div className="mt-2">
                    <span className="block text-[10px] font-medium sm:text-xs">
                      예약 {summary.reservationCount}건
                    </span>

                    <span className="mt-0.5 block text-[9px] text-gray-500 sm:text-xs">
                      수량 {summary.reservedQuantity}개
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 선택 날짜 예약 */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-bold">{date} 예약</h3>

        {reservations.isLoading ? (
          <p className="py-6 text-sm text-gray-500" role="status">
            예약을 불러오는 중입니다.
          </p>
        ) : reservations.isError ? (
          <div className="py-6" role="alert">
            <p className="text-sm text-red-500">예약을 불러오지 못했습니다.</p>

            <button
              type="button"
              onClick={() => void reservations.refetch()}
              className="mt-2 text-sm underline"
            >
              다시 시도
            </button>
          </div>
        ) : !reservations.data?.length ? (
          <p className="py-6 text-sm text-gray-500">
            해당 날짜에 예약 내역이 없습니다.
          </p>
        ) : (
          <>
            {renderReservationItems(roomReservations, "ROOM")}

            {renderReservationItems(pyeongsangReservations, "PYEONGSANG")}
          </>
        )}
      </div>
    </section>
  );
}
