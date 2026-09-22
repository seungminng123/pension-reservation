import { useState } from "react";
import MonthNavigation from "@/components/common/MonthNavigation";
import { formatDate, monthDates } from "@/utils/date";
export default function ReservationDateCalendar({
  checkIn,
  checkOut,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const today = formatDate(new Date());
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const select = (date: string) => {
    if (!checkIn || checkOut || date <= checkIn) onChange(date, "");
    else onChange(checkIn, date);
  };
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
        {checkIn && !checkOut
          ? "체크아웃 날짜를 선택해 주세요."
          : "체크인 날짜를 선택해 주세요."}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <span key={day} className="py-2 text-xs text-gray-500">
            {day}
          </span>
        ))}
        {Array.from({ length: month.getDay() }, (_, index) => (
          <div key={index} />
        ))}
        {monthDates(month).map((date) => {
          const endpoint = date === checkIn || date === checkOut;
          const inRange =
            checkIn && checkOut && date > checkIn && date < checkOut;
          return (
            <button
              key={date}
              type="button"
              aria-label={date}
              aria-pressed={endpoint || Boolean(inRange)}
              disabled={date < today}
              onClick={() => select(date)}
              className={`min-h-12 min-w-0 rounded-xl text-sm sm:min-h-16 disabled:text-gray-300 ${endpoint ? "bg-black text-white" : inRange ? "bg-gray-200" : "hover:bg-gray-100"}`}
            >
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>
      <div
        className="mt-5 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2"
        aria-live="polite"
      >
        <p>
          체크인: <strong>{checkIn || "선택 전"}</strong>
        </p>
        <p>
          체크아웃: <strong>{checkOut || "선택 전"}</strong>
        </p>
      </div>
    </section>
  );
}
