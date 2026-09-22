import { CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getRoomImageUrl, getRooms } from "@/api/room";

export default function HomePage() {
  const {
    data: rooms,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  if (isLoading) {
    return (
      <main className="p-6">
        <p>객실을 불러오는 중입니다.</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <p>객실 정보를 불러오지 못했습니다.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-5 sm:py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">펜션 예약</h1>

          <p className="mt-2 text-gray-500">
            원하는 객실과 날짜를 선택해 주세요.
          </p>
        </div>

        <Link
          to="/reservation/lookup"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm"
        >
          <CalendarDays size={20} strokeWidth={2} aria-hidden="true" /> 예약
          조회
        </Link>
      </div>

      {rooms?.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-gray-500">
          등록된 객실이 없습니다.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rooms?.map((room) => (
            <Link
              key={room.roomId}
              to={`/rooms/${room.roomId}`}
              className="min-w-0 overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg"
            >
              {room.hasImage ? (
                <img
                  src={getRoomImageUrl(room.roomId)}
                  alt={room.name}
                  className="aspect-[4/3] w-full object-cover sm:aspect-auto sm:h-60"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center sm:aspect-auto sm:h-60 justify-center bg-gray-100 text-gray-400">
                  이미지 없음
                </div>
              )}

              <div className="p-5">
                <p className="text-sm text-gray-500">{room.type}</p>

                <h2 className="mt-1 text-xl font-bold">{room.name}</h2>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <p className="text-sm text-gray-500">
                    기준 {room.guestCount}명 · 최대 {room.maxGuests}명
                  </p>

                  <p className="font-bold">
                    {room.price.toLocaleString()}원
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      / 박
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
