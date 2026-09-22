import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getAdminReservationCalendar,
  getAdminReservationsByDate,
  getAdminRooms,
} from "@/api/admin";

import AdminReservationNumberGrid, {
  type ReservationUnitItem,
} from "@/components/admin/AdminReservationNumberGrid";
import MonthNavigation from "@/components/common/MonthNavigation";

import { formatDate, monthDates } from "@/utils/date";

import type { AdminRoom } from "@/types/admin";

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

  const rooms = useQuery({
    queryKey: ["adminRooms"],
    queryFn: getAdminRooms,
  });

  const days = new Map(calendar.data?.map((day) => [day.date, day]));

  /*
   * =========================
   * 해당 방/평상의 활성 예약 찾기
   * =========================
   *
   * CANCELED:
   * 이미 취소가 완료된 예약이므로
   * 숫자 카드에서는 예약 가능 상태로 처리한다.
   */
  const findActiveReservation = (roomId: number) => {
    const matchingReservations =
      reservations.data?.filter(
        (reservation) =>
          reservation.roomId === roomId && reservation.status !== "CANCELED",
      ) ?? [];

    /*
     * 같은 방에 여러 데이터가 있을 경우
     * 관리자가 우선 확인해야 하는 상태 순서로 찾는다.
     */
    return (
      matchingReservations.find(
        (reservation) => reservation.status === "CANCEL_REQUESTED",
      ) ??
      matchingReservations.find(
        (reservation) => reservation.status === "PENDING",
      ) ??
      matchingReservations.find(
        (reservation) => reservation.status === "CONFIRMED",
      )
    );
  };

  /*
   * =========================
   * 숫자 카드 상태 변환
   * =========================
   *
   * 예약 없음 / CANCELED
   * -> AVAILABLE
   *
   * PENDING
   * -> 입금 확인 대기
   *
   * CONFIRMED
   * -> 예약 확정
   *
   * CANCEL_REQUESTED
   * -> 취소 요청
   */
  const createUnitItem = (room: AdminRoom): ReservationUnitItem => {
    const reservation = findActiveReservation(room.roomId);

    // 예약 없음
    if (!reservation) {
      return {
        roomId: room.roomId,
        name: room.name,
        type: room.type,
        status: "AVAILABLE",
      };
    }

    // 입금 확인 대기
    if (reservation.status === "PENDING") {
      return {
        roomId: room.roomId,
        name: room.name,
        type: room.type,
        status: "PENDING",
      };
    }

    // 예약 확정
    if (reservation.status === "CONFIRMED") {
      return {
        roomId: room.roomId,
        name: room.name,
        type: room.type,
        status: "CONFIRMED",
      };
    }

    // 취소 요청
    if (reservation.status === "CANCEL_REQUESTED") {
      return {
        roomId: room.roomId,
        name: room.name,
        type: room.type,
        status: "CANCEL_REQUESTED",
      };
    }

    // CANCELED 등
    return {
      roomId: room.roomId,
      name: room.name,
      type: room.type,
      status: "AVAILABLE",
    };
  };

  /*
   * =========================
   * 방 숫자 카드
   * =========================
   */
  const roomUnits: ReservationUnitItem[] = (rooms.data ?? [])
    .filter((room) => room.type === "ROOM")
    .map(createUnitItem);

  /*
   * =========================
   * 평상 숫자 카드
   * =========================
   */
  const pyeongsangUnits: ReservationUnitItem[] = (rooms.data ?? [])
    .filter((room) => room.type === "PYEONGSANG")
    .map(createUnitItem);

  /*
   * =========================
   * 숫자 카드 선택
   * =========================
   *
   * 예약이 있는 번호:
   * -> 예약 상세 모달 열기
   *
   * 예약 가능한 번호:
   * -> 선택 표시만
   */
  const handleSelectUnit = (roomId: number) => {
    const reservation = findActiveReservation(roomId);

    // 예약 가능한 상태면 상세 예약이 없으므로 아무것도 열지 않음
    if (!reservation) {
      return;
    }

    // 예약이 있으면 예약 상세 모달 열기
    onSelect(reservation.reservationId);
  };
  /*
   * =========================
   * 날짜 변경
   * =========================
   */
  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
  };

  return (
    <section className="rounded-2xl border bg-white p-3 sm:p-5">
      {/* 헤더 */}
      <div className="mb-5">
        <h3 className="text-xl font-bold">예약 현황</h3>

        <p className="mt-1 text-sm text-gray-500">
          날짜를 선택하면 해당 날짜의 방과 평상 예약 상태를 확인할 수 있습니다.
        </p>
      </div>

      {/* 월 이동 */}
      <MonthNavigation
        month={month}
        onChange={(nextMonth) => {
          setMonth(nextMonth);

          setDate(formatDate(nextMonth));
        }}
      />

      {/* 달력 */}
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
                onClick={() => handleDateChange(day)}
                className={`min-h-20 min-w-0 rounded-lg border px-1 py-2 text-center transition sm:min-h-24 sm:rounded-xl ${
                  isSelected
                    ? "border-black bg-gray-100"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <span className="text-sm font-semibold">
                  {Number(day.slice(-2))}
                </span>

                {/* 예약 있는 날 */}
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

      {/* 선택 날짜 예약 현황 */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-bold">{date} 예약 현황</h3>

        <p className="mt-1 text-xs text-gray-400">
          예약이 있는 번호를 선택하면 상세 정보를 확인할 수 있습니다.
        </p>

        {reservations.isLoading || rooms.isLoading ? (
          <p className="py-6 text-sm text-gray-500" role="status">
            예약 현황을 불러오는 중입니다.
          </p>
        ) : reservations.isError || rooms.isError ? (
          <div className="py-6" role="alert">
            <p className="text-sm text-red-500">
              예약 현황을 불러오지 못했습니다.
            </p>

            <button
              type="button"
              onClick={() => {
                void reservations.refetch();
                void rooms.refetch();
              }}
              className="mt-2 text-sm underline"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            {/* 방 */}
            {roomUnits.length > 0 && (
              <AdminReservationNumberGrid
                title="방"
                items={roomUnits}
                onSelect={handleSelectUnit}
              />
            )}

            {/* 평상 */}
            {pyeongsangUnits.length > 0 && (
              <AdminReservationNumberGrid
                title="평상"
                items={pyeongsangUnits}
                onSelect={handleSelectUnit}
              />
            )}

            {!roomUnits.length && !pyeongsangUnits.length && (
              <p className="py-6 text-sm text-gray-500">
                등록된 방과 평상이 없습니다.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
