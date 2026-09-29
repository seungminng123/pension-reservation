import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getRoomImageUrl, getRooms } from "@/api/room";
import HomeImage from "./HomeImage";
import ScrollReveal from "./ScrollReveal";

export default function RoomSection() {
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
  const rooms = data?.filter((room) => room.type === "ROOM");
  return (
    <section id="rooms" className="bg-stone-50" aria-labelledby="rooms-title">
      <div className="home-container home-section">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="home-label">OUR ROOMS</p>
            <h2 id="rooms-title" className="home-title">
              쉼이 시작되는 공간
            </h2>
            <p className="home-description">
              함께하는 사람과 여행에 맞는 객실을 만나보세요.
            </p>
          </div>
          <Link
            to="/reservation"
            className="inline-flex min-h-11 items-center gap-2 border-b border-stone-400 text-sm"
          >
            전체 객실 예약 확인 <ArrowUpRight size={18} />
          </Link>
        </div>
        {isPending ? (
          <p role="status" className="py-12 text-center text-stone-500">
            객실 정보를 불러오는 중입니다.
          </p>
        ) : isError ? (
          <div
            role="alert"
            className="rounded-xl border border-stone-200 bg-white p-8 text-center"
          >
            <p>객실 정보를 불러오지 못했습니다.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="home-button mt-5"
            >
              {isFetching ? "불러오는 중…" : "다시 시도"}
            </button>
          </div>
        ) : !rooms?.length ? (
          <p className="py-12 text-center text-stone-500">
            객실 안내를 준비하고 있습니다.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room, index) => (
              <ScrollReveal
                key={room.roomId}
                delay={(index % 4) * 90}
                className="min-w-0"
              >
                <Link
                  to={`/rooms/${room.roomId}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-stone-200 bg-white transition-colors hover:border-stone-500"
                >
                  <HomeImage
                    src={
                      room.hasImage ? getRoomImageUrl(room.roomId) : undefined
                    }
                    alt={room.name}
                    className="aspect-[4/3]"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <p className="mt-2 text-sm text-stone-500">
                      최대 {room.maxGuests}명
                    </p>
                    <p className="mt-5 font-semibold">
                      {room.price.toLocaleString()}원{" "}
                      <span className="text-xs font-normal text-stone-500">
                        / 기본 1박
                      </span>
                    </p>
                    <span className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                      상세보기 <ArrowUpRight size={18} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
        <p className="mt-6 text-xs text-stone-500">
          기본 요금 안내이며, 날짜별 실제 요금과 예약 가능 여부는 예약 화면에서
          확인해 주세요.
        </p>
      </div>
    </section>
  );
}
