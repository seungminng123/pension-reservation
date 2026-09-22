import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getAvailableRooms } from "@/api/room";

import AvailableRoomCard from "@/components/reservation/AvailableRoomCard";

import type { RoomType } from "@/types/room";

type AvailableRoomListProps = {
  checkIn: string;
  checkOut: string;
  type: RoomType;
};

export default function AvailableRoomList({
  checkIn,
  checkOut,
  type,
}: AvailableRoomListProps) {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["availableRooms", checkIn, checkOut],
    queryFn: () => getAvailableRooms(checkIn, checkOut),
  });

  const filteredRooms = query.data?.filter((room) => room.type === type) ?? [];

  const typeLabel = type === "ROOM" ? "방" : "평상";

  const handleSelectRoom = (roomId: number) => {
    const searchParams = new URLSearchParams({
      checkIn,
      checkOut,
    });

    navigate(`/rooms/${roomId}?${searchParams.toString()}`);
  };

  return (
    <section
      className="mt-8 scroll-mt-6"
      aria-labelledby="available-rooms-title"
    >
      <div className="mb-5">
        <h2 id="available-rooms-title" className="text-2xl font-bold">
          예약 가능한 {typeLabel}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {type === "ROOM"
            ? `${checkIn} ~ ${checkOut}`
            : `${checkIn} ~ ${checkOut}`}
        </p>
      </div>

      {query.isFetching ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center">
          <p role="status" className="text-sm text-gray-500">
            예약 가능한 {typeLabel}을 확인하고 있습니다.
          </p>
        </div>
      ) : query.isError ? (
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
        <div className="rounded-xl bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">
            선택한 일정에 예약 가능한 {typeLabel}이 없습니다.
          </p>
        </div>
      )}
    </section>
  );
}
