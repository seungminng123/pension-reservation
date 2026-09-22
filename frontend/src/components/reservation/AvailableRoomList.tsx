import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAvailableRooms } from "@/api/room";
import AvailableRoomCard from "@/components/reservation/AvailableRoomCard";
export default function AvailableRoomList({
  checkIn,
  checkOut,
}: {
  checkIn: string;
  checkOut: string;
}) {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["availableRooms", checkIn, checkOut],
    queryFn: () => getAvailableRooms(checkIn, checkOut),
  });
  return (
    <section className="mt-8" aria-labelledby="available-rooms-title">
      <h2 id="available-rooms-title" className="mb-2 text-2xl font-bold">
        예약 가능한 상품
      </h2>
      <p className="mb-5 text-sm text-gray-500">
        {checkIn} ~ {checkOut}
      </p>
      {query.isFetching ? (
        <p role="status">상품을 불러오는 중입니다.</p>
      ) : query.isError ? (
        <div role="alert">
          상품을 불러오지 못했습니다.{" "}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="rounded-xl border p-3"
          >
            다시 시도
          </button>
        </div>
      ) : (
        (["ROOM", "PYEONGSANG"] as const).map((type) => {
          const rooms = query.data?.filter((room) => room.type === type) ?? [];
          return (
            <section key={type} className="mb-6">
              <h3 className="mb-3 text-lg font-bold">
                {type === "ROOM" ? "방" : "평상"}
              </h3>
              {rooms.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {rooms.map((room) => (
                    <AvailableRoomCard
                      key={room.roomId}
                      room={room}
                      onSelect={() =>
                        navigate(
                          `/rooms/${room.roomId}?${new URLSearchParams({ checkIn, checkOut })}`,
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                  등록된 상품이 없습니다.
                </p>
              )}
            </section>
          );
        })
      )}
    </section>
  );
}
