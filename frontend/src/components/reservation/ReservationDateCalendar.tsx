import { useState } from "react";

import MonthNavigation from "@/components/common/MonthNavigation";

import { addDays, formatDate, monthDates } from "@/utils/date";

import type { RoomType } from "@/types/room";

type ReservationDateCalendarProps = {
  type: RoomType;
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
};

export default function ReservationDateCalendar({
  type,
  checkIn,
  checkOut,
  onChange,
}: ReservationDateCalendarProps) {
  const today = formatDate(new Date());

  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const selectDate = (date: string) => {
    // 평상은 날짜 1개만 선택
    // 내부적으로 다음 날을 checkOut으로 설정
    if (type === "PYEONGSANG") {
      onChange(date, addDays(date, 1));

      return;
    }

    // 방 예약 - 체크인 선택
    if (!checkIn) {
      onChange(date, "");

      return;
    }

    // 이미 기간 선택이 끝났으면 새 체크인부터 다시 선택
    if (checkOut) {
      onChange(date, "");

      return;
    }

    // 체크인보다 이전 또는 같은 날짜를 누르면 체크인 재선택
    if (date <= checkIn) {
      onChange(date, "");

      return;
    }

    // 방 예약 - 체크아웃 선택
    onChange(checkIn, date);
  };

  const guideText =
    type === "ROOM"
      ? checkIn && !checkOut
        ? "체크아웃 날짜를 선택해 주세요."
        : "체크인 날짜를 선택해 주세요."
      : "평상 이용 날짜를 선택해 주세요.";

  return (
    <section
      className="rounded-2xl border bg-white p-3 sm:p-6"
      aria-label="예약 날짜 선택"
    >
      <MonthNavigation
        month={month}
        onChange={setMonth}
        previousDisabled={formatDate(month).slice(0, 7) <= today.slice(0, 7)}
      />

      <p className="my-4 text-sm text-gray-500" aria-live="polite">
        {guideText}
      </p>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <span key={day} className="py-2 text-xs text-gray-500">
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

        {monthDates(month).map((date) => {
          const isRoom = type === "ROOM";

          const endpoint = isRoom && (date === checkIn || date === checkOut);

          const inRange =
            isRoom &&
            Boolean(checkIn) &&
            Boolean(checkOut) &&
            date > checkIn &&
            date < checkOut;

          const isPyeongsangSelected =
            type === "PYEONGSANG" && date === checkIn;

          const isSelected =
            endpoint || Boolean(inRange) || isPyeongsangSelected;

          return (
            <button
              key={date}
              type="button"
              aria-label={date}
              aria-pressed={isSelected}
              disabled={date < today}
              onClick={() => selectDate(date)}
              className={`min-h-12 min-w-0 rounded-xl text-sm sm:min-h-16 disabled:text-gray-300 ${
                endpoint || isPyeongsangSelected
                  ? "bg-black text-white"
                  : inRange
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
              }`}
            >
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>

      {/* 선택 날짜 요약 */}
      <div
        className="mt-5 rounded-xl bg-gray-50 p-4 text-sm"
        aria-live="polite"
      >
        {type === "ROOM" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              체크인: <strong>{checkIn || "선택 전"}</strong>
            </p>

            <p>
              체크아웃: <strong>{checkOut || "선택 전"}</strong>
            </p>
          </div>
        ) : (
          <p>
            이용일: <strong>{checkIn || "선택 전"}</strong>
          </p>
        )}
      </div>
    </section>
  );
}
