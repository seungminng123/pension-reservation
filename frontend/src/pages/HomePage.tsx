import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ReservationDateCalendar from "@/components/reservation/ReservationDateCalendar";
import AvailableRoomList from "@/components/reservation/AvailableRoomList";
export default function HomePage() {
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-5 sm:py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">펜션 예약</h1>
          <p className="mt-2 text-gray-500">이용 날짜를 선택해 주세요.</p>
        </div>
        <Link
          to="/reservation/lookup"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm"
        >
          <CalendarDays size={20} /> 예약 조회
        </Link>
      </div>
      <ReservationDateCalendar
        {...dates}
        onChange={(checkIn, checkOut) => {
          setDates({ checkIn, checkOut });
        }}
      />
      {dates.checkIn && dates.checkOut && <AvailableRoomList {...dates} />}
    </main>
  );
}
