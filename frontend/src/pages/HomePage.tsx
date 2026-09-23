import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import AvailableRoomList from "@/components/reservation/AvailableRoomList";
import ReservationDateCalendar from "@/components/reservation/ReservationDateCalendar";

import type { RoomType } from "@/types/room";

export default function HomePage() {
  const [searchParams] = useSearchParams();

  const fromAdmin = searchParams.get("from") === "admin";

  const [selectedType, setSelectedType] = useState<RoomType>("ROOM");

  const [dates, setDates] = useState({
    checkIn: "",
    checkOut: "",
  });

  const handleTypeChange = (type: RoomType) => {
    setSelectedType(type);

    // 예약 종류를 바꾸면 기존 날짜 선택 초기화
    setDates({
      checkIn: "",
      checkOut: "",
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-5 sm:py-10">
      {/* 헤더 */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">펜션 예약</h1>

          <p className="mt-2 text-gray-500">
            {selectedType === "ROOM"
              ? "숙박할 날짜를 선택해 주세요."
              : "평상을 이용할 날짜를 선택해 주세요."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 관리자에서 들어온 경우에만 표시 */}
          {fromAdmin && (
            <Link
              to="/admin"
              className="inline-flex min-h-11 items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              ← 관리자 현황으로 돌아가기
            </Link>
          )}

          <Link
            to="/reservation/lookup"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm"
          >
            <CalendarDays size={20} />
            예약 조회
          </Link>
        </div>
      </div>

      {/* 예약 종류 */}
      <section className="mb-6">
        <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => handleTypeChange("ROOM")}
            className={`rounded-lg py-3 text-sm font-semibold transition ${
              selectedType === "ROOM"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500"
            }`}
          >
            방 예약
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("PYEONGSANG")}
            className={`rounded-lg py-3 text-sm font-semibold transition ${
              selectedType === "PYEONGSANG"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500"
            }`}
          >
            평상 예약
          </button>
        </div>
      </section>

      {/* 날짜 선택 */}
      <ReservationDateCalendar
        type={selectedType}
        checkIn={dates.checkIn}
        checkOut={dates.checkOut}
        onChange={(checkIn, checkOut) => {
          setDates({
            checkIn,
            checkOut,
          });
        }}
      />

      {/* 예약 가능한 상품 */}
      {dates.checkIn && dates.checkOut && (
        <AvailableRoomList
          type={selectedType}
          checkIn={dates.checkIn}
          checkOut={dates.checkOut}
        />
      )}
    </main>
  );
}
