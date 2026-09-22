import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getRoomAvailability } from "@/api/room";

type RoomReservationCalendarProps = {
  roomId: number;
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getToday = () => {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const formatPrice = (price: number) => {
  if (price >= 10000) {
    const tenThousands = price / 10000;

    if (Number.isInteger(tenThousands)) {
      return `${tenThousands.toLocaleString()}만`;
    }
  }

  return `${price.toLocaleString()}원`;
};

export default function RoomReservationCalendar({
  roomId,
  checkIn,
  checkOut,
  onChange,
}: RoomReservationCalendarProps) {
  const today = getToday();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = currentMonth.getFullYear();

  const month = currentMonth.getMonth() + 1;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["roomAvailability", roomId, year, month],

    queryFn: () => getRoomAvailability(roomId, year, month),
  });

  // 예약 불가능 날짜
  const unavailableDates = useMemo(
    () => new Set(data?.unavailableDates ?? []),
    [data],
  );

  // 날짜별 가격
  const priceMap = useMemo(
    () => new Map((data?.dailyPrices ?? []).map((item) => [item.date, item])),
    [data],
  );

  const firstDay = new Date(year, month - 1, 1).getDay();

  const lastDate = new Date(year, month, 0).getDate();

  const dates = Array.from(
    {
      length: lastDate,
    },
    (_, index) => new Date(year, month - 1, index + 1),
  );

  const isSelectingCheckOut = checkIn !== "" && checkOut === "";

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth() + 1;

  // 이전 달
  const handlePreviousMonth = () => {
    if (isCurrentMonth) {
      return;
    }

    setCurrentMonth(new Date(year, month - 2, 1));
  };

  // 다음 달
  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month, 1));
  };

  // 날짜 선택
  const handleDateClick = (date: Date) => {
    const dateString = formatDate(date);

    if (date < today) {
      return;
    }

    const unavailable = unavailableDates.has(dateString);

    // 체크인 선택
    if (!checkIn || checkOut) {
      if (unavailable) {
        return;
      }

      onChange(dateString, "");

      return;
    }

    // 체크인 다시 선택
    if (dateString <= checkIn) {
      if (unavailable) {
        return;
      }

      onChange(dateString, "");

      return;
    }

    // 체크아웃 선택
    onChange(checkIn, dateString);
  };

  // 선택 범위 확인
  const isInSelectedRange = (dateString: string) => {
    if (!checkIn) {
      return false;
    }

    if (!checkOut) {
      return dateString === checkIn;
    }

    return dateString >= checkIn && dateString <= checkOut;
  };

  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-6">
      {/* 월 이동 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={isCurrentMonth}
          onClick={handlePreviousMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border text-xl disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="이전 달"
        >
          ‹
        </button>

        <h3 className="font-bold">
          {year}년 {month}월
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border text-xl"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {/* 요일 */}
      <div className="mt-6 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
        <span className="text-red-400">일</span>

        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>

        <span className="text-blue-400">토</span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">
          예약 가능 날짜를 불러오는 중입니다.
        </div>
      ) : isError ? (
        <div className="py-16 text-center text-sm text-red-500">
          예약 정보를 불러오지 못했습니다.
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-7 gap-1">
          {/* 빈 날짜 */}
          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-16 sm:min-h-20" />
          ))}

          {dates.map((date) => {
            const dateString = formatDate(date);

            const isPast = date < today;

            const unavailable = unavailableDates.has(dateString);

            const selected = isInSelectedRange(dateString);

            const dailyPrice = priceMap.get(dateString);

            const disabled = isPast || (unavailable && !isSelectingCheckOut);

            const dayOfWeek = date.getDay();

            return (
              <button
                key={dateString}
                type="button"
                disabled={disabled}
                onClick={() => handleDateClick(date)}
                className={[
                  "relative flex min-h-16 flex-col items-center justify-center rounded-xl px-1 transition sm:min-h-20",

                  disabled
                    ? "cursor-not-allowed bg-gray-50 text-gray-300"
                    : "hover:bg-gray-100",

                  selected ? "bg-black text-white hover:bg-black" : "",
                ].join(" ")}
              >
                {/* 날짜 */}
                <span
                  className={[
                    "text-sm font-semibold",

                    !selected && !disabled && dayOfWeek === 0
                      ? "text-red-500"
                      : "",

                    !selected && !disabled && dayOfWeek === 6
                      ? "text-blue-500"
                      : "",
                  ].join(" ")}
                >
                  {date.getDate()}
                </span>

                {/* 가격 */}
                {unavailable ? (
                  <span
                    className={[
                      "mt-1 text-[9px] sm:text-[10px]",

                      selected ? "text-white" : "text-red-400",
                    ].join(" ")}
                  >
                    예약마감
                  </span>
                ) : dailyPrice ? (
                  <span
                    className={[
                      "mt-1 text-[9px] sm:text-[10px]",

                      selected ? "text-white" : "text-gray-500",
                    ].join(" ")}
                  >
                    {formatPrice(dailyPrice.price)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* 상태 안내 */}
      <div className="mt-5 flex flex-wrap gap-5 border-t pt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-black" />
          선택한 일정
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-gray-100" />
          예약 마감
        </div>
      </div>

      {/* 선택한 날짜 */}
      <div className="mt-5 rounded-xl bg-gray-50 p-4">
        {!checkIn && (
          <p className="text-sm text-gray-600">체크인 날짜를 선택해 주세요.</p>
        )}

        {checkIn && !checkOut && (
          <div>
            <p className="text-xs text-gray-500">체크인</p>

            <p className="mt-1 font-semibold">{checkIn}</p>

            <p className="mt-2 text-sm text-gray-500">
              체크아웃 날짜를 선택해 주세요.
            </p>
          </div>
        )}

        {checkIn && checkOut && (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <p className="text-xs text-gray-500">체크인</p>

              <p className="mt-1 text-sm font-bold">{checkIn}</p>
            </div>

            <span className="text-gray-300">→</span>

            <div className="text-right">
              <p className="text-xs text-gray-500">체크아웃</p>

              <p className="mt-1 text-sm font-bold">{checkOut}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
