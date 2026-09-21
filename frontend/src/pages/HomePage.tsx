import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getRooms } from "@/api/room";

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
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">펜션 예약</h1>
          <p className="mt-2 text-gray-500">
            원하는 객실과 날짜를 선택해 주세요.
          </p>
        </div>

        <Link
          to="/reservation/lookup"
          className="rounded-lg border px-4 py-2 text-sm"
        >
          예약 조회
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
              className="overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg"
            >
              {room.imageUrl ? (
                <img
                  src={room.imageUrl}
                  alt={room.name}
                  className="h-60 w-full object-cover"
                />
              ) : (
                <div className="flex h-60 items-center justify-center bg-gray-100 text-gray-400">
                  이미지 없음
                </div>
              )}

              <div className="p-5">
                <p className="text-sm text-gray-500">{room.type}</p>

                <h2 className="mt-1 text-xl font-bold">{room.name}</h2>

                <div className="mt-4 flex items-end justify-between">
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
