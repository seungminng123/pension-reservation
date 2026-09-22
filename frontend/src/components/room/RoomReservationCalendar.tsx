import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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

    return `${tenThousands.toLocaleString("ko-KR", {
      maximumFractionDigits: 4,
    })}만`;
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

  const unavailableDates = useMemo(
    () => new Set(data?.unavailableDates ?? []),
    [data],
  );

  const priceMap = useMemo(
    () => new Map((data?.dailyPrices ?? []).map((item) => [item.date, item])),
    [data],
  );

  const stockMap = useMemo(
    () => new Map((data?.dailyStocks ?? []).map((item) => [item.date, item])),
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

  const handlePreviousMonth = () => {
    if (isCurrentMonth) {
      return;
    }

    setCurrentMonth(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateString = formatDate(date);

    if (date < today) {
      return;
    }

    const unavailable = unavailableDates.has(dateString);

    if (!checkIn || checkOut) {
      if (unavailable) {
        return;
      }

      onChange(dateString, "");

      return;
    }

    if (dateString <= checkIn) {
      if (unavailable) {
        return;
      }

      onChange(dateString, "");

      return;
    }

    // 체크아웃 날짜는 해당 날짜 재고를 사용하지 않음
    onChange(checkIn, dateString);
  };

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
    <div className="min-w-0 rounded-2xl border bg-white p-2 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={isCurrentMonth}
          onClick={handlePreviousMonth}
          className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
          aria-label="이전 달"
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="font-bold">
          {year}년 {month}월
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-11 w-11 items-center justify-center rounded-full border"
          aria-label="다음 달"
        >
          <ChevronRight size={20} />
        </button>
      </div>

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
        <div className="mt-2 grid grid-cols-7 gap-0.5 sm:gap-1">
          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-20" />
          ))}

          {dates.map((date) => {
            const dateString = formatDate(date);

            const isPast = date < today;

            const unavailable = unavailableDates.has(dateString);

            const selected = isInSelectedRange(dateString);

            const dailyPrice = priceMap.get(dateString);

            const dailyStock = stockMap.get(dateString);

            const disabled = isPast || (unavailable && !isSelectingCheckOut);

            const dayOfWeek = date.getDay();

            return (
              <button
                key={dateString}
                type="button"
                disabled={disabled}
                onClick={() => handleDateClick(date)}
                className={[
                  "relative flex min-h-20 min-w-0 flex-col items-center justify-center rounded-lg px-0 py-2 transition sm:min-h-24 sm:rounded-xl sm:px-1",
                  disabled
                    ? "cursor-not-allowed bg-gray-50 text-gray-300"
                    : "hover:bg-gray-100",
                  selected ? "bg-black text-white hover:bg-black" : "",
                ].join(" ")}
              >
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

                {unavailable ? (
                  <span className="mt-1 text-[9px] text-red-400 sm:text-[10px]">
                    예약마감
                  </span>
                ) : (
                  <>
                    {dailyPrice && (
                      <span
                        className={[
                          "mt-1 text-[9px] leading-tight sm:text-[10px]",
                          selected ? "text-white" : "text-gray-500",
                        ].join(" ")}
                      >
                        {formatPrice(dailyPrice.price)}
                      </span>
                    )}

                    {dailyStock && (
                      <span
                        className={[
                          "mt-0.5 text-[8px] leading-tight sm:text-[9px]",
                          selected ? "text-gray-200" : "text-gray-400",
                        ].join(" ")}
                      >
                        잔여 {dailyStock.remainingCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}

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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div>
              <p className="text-xs text-gray-500">체크인</p>

              <p className="mt-1 text-sm font-bold">{checkIn}</p>
            </div>

            <ArrowRight size={20} className="hidden text-gray-300 sm:block" />

            <div className="sm:text-right">
              <p className="text-xs text-gray-500">체크아웃</p>

              <p className="mt-1 text-sm font-bold">{checkOut}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
