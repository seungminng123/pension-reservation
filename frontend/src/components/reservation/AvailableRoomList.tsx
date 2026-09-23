import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getAvailableRooms } from "@/api/room";

import AvailableRoomCard from "@/components/reservation/AvailableRoomCard";

import type { AvailableRoom, RoomType } from "@/types/room";

type AvailableRoomListProps = {
  checkIn: string;
  checkOut: string;
  type: RoomType;
};

const isSoldOut = (room: AvailableRoom) =>
  !room.available || room.remainingCount <= 0;

const getPyeongsangNumber = (room: AvailableRoom) => {
  const match = room.name.match(/\d+/);

  return match ? Number(match[0]) : null;
};

export default function AvailableRoomList({
  checkIn,
  checkOut,
  type,
}: AvailableRoomListProps) {
  const navigate = useNavigate();
  const [originParams] = useSearchParams();

  const query = useQuery({
    queryKey: ["availableRooms", checkIn, checkOut],
    queryFn: () => getAvailableRooms(checkIn, checkOut),
  });

  const filteredRooms = query.data?.filter((room) => room.type === type) ?? [];

  const pyeongsangRooms =
    type === "PYEONGSANG"
      ? [...filteredRooms].sort((a, b) => {
          const aNumber = getPyeongsangNumber(a);
          const bNumber = getPyeongsangNumber(b);

          if (aNumber === null && bNumber === null) {
            return a.roomId - b.roomId;
          }

          if (aNumber === null) return 1;
          if (bNumber === null) return -1;

          return aNumber - bNumber;
        })
      : [];

  const availablePyeongsangCount = pyeongsangRooms.filter(
    (room) => !isSoldOut(room),
  ).length;

  const unavailablePyeongsangCount =
    pyeongsangRooms.length - availablePyeongsangCount;

  const typeLabel = type === "ROOM" ? "방" : "평상";

  const handleSelectRoom = (roomId: number) => {
    const searchParams = new URLSearchParams({
      checkIn,
      checkOut,
    });

    if (originParams.get("from") === "admin") searchParams.set("from", "admin");
    navigate(`/rooms/${roomId}?${searchParams.toString()}`);
  };

  return (
    <section
      className="mt-8 scroll-mt-6"
      aria-labelledby="available-rooms-title"
    >
      {/* 제목 */}
      <div className="mb-5">
        <h2 id="available-rooms-title" className="text-2xl font-bold">
          {type === "ROOM" ? "예약 가능한 방" : "평상 선택"}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {checkIn} ~ {checkOut}
        </p>
      </div>

      {/* 로딩 */}
      {query.isFetching ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center">
          <p role="status" className="text-sm text-gray-500">
            예약 가능한 {typeLabel}을 확인하고 있습니다.
          </p>
        </div>
      ) : query.isError ? (
        /* 에러 */
        <div role="alert" className="rounded-xl bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">
            예약 가능한 {typeLabel}을 불러오지 못했습니다.
          </p>

          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-4 rounded-xl border px-4 py-3 text-sm"
          >
            다시 시도
          </button>
        </div>
      ) : filteredRooms.length > 0 ? (
        type === "ROOM" ? (
          /* =========================
             방
          ========================= */
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredRooms.map((room) => (
              <AvailableRoomCard
                key={room.roomId}
                room={room}
                onSelect={() => handleSelectRoom(room.roomId)}
              />
            ))}
          </div>
        ) : (
          /* =========================
             평상
          ========================= */
          <div>
            {/* 예약 현황 */}
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white sm:text-xs">
                예약 가능 {availablePyeongsangCount}개
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-500 sm:text-xs">
                예약 불가 {unavailablePyeongsangCount}개
              </span>

              <span className="ml-auto whitespace-nowrap text-[11px] text-gray-400 sm:text-xs">
                전체 {pyeongsangRooms.length}개
              </span>
            </div>

            {/* =========================
                평상 번호
                모바일부터 10개씩
            ========================= */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {pyeongsangRooms.map((room) => {
                const soldOut = isSoldOut(room);
                const number = getPyeongsangNumber(room);

                return (
                  <button
                    key={room.roomId}
                    type="button"
                    disabled={soldOut}
                    onClick={() => handleSelectRoom(room.roomId)}
                    aria-label={`${room.name} ${
                      soldOut ? "예약 불가" : "예약 가능"
                    }`}
                    title={`${room.name} - ${
                      soldOut ? "예약 불가" : "예약 가능"
                    }`}
                    className={`flex h-8 min-w-0 items-center justify-center rounded-md border text-[11px] font-bold transition sm:h-10 sm:rounded-lg sm:text-xs ${
                      soldOut
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-black bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {number ?? room.name}
                  </button>
                );
              })}
            </div>

            {/* 안내 */}
            <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-black" />
                예약 가능
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm border border-gray-200 bg-gray-100" />
                예약 불가
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-400 sm:text-xs">
              예약 가능한 평상을 선택하면 상세 예약 화면으로 이동합니다.
            </p>
          </div>
        )
      ) : (
        /* 데이터 없음 */
        <div className="rounded-xl bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">
            선택한 일정에 등록된 {typeLabel}이 없습니다.
          </p>
        </div>
      )}
    </section>
  );
}
