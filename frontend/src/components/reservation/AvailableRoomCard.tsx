import { getRoomImageUrl } from "@/api/room";
import type { AvailableRoom } from "@/types/room";
export default function AvailableRoomCard({
  room,
  onSelect,
}: {
  room: AvailableRoom;
  onSelect: () => void;
}) {
  const soldOut = !room.available || room.remainingCount <= 0;
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={onSelect}
      className="min-w-0 overflow-hidden rounded-2xl border bg-white text-left enabled:hover:border-black disabled:opacity-60"
    >
      {room.hasImage ? (
        <img
          src={getRoomImageUrl(room.roomId)}
          alt={room.name}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-gray-100 text-gray-400">
          이미지 없음
        </div>
      )}
      <div className="space-y-2 p-4">
        <h4 className="text-lg font-bold">{room.name}</h4>
        <p className="text-sm text-gray-500">
          기준 {room.guestCount}명 · 최대 {room.maxGuests}명
        </p>
        <p className="text-sm">기본 {room.price.toLocaleString()}원 / 박</p>
        <p className="font-semibold">
          선택 기간 {room.totalPrice.toLocaleString()}원
        </p>
        <p className="text-sm">
          {soldOut ? "예약 마감" : `잔여 ${room.remainingCount}개`}
        </p>
        <span
          className={`block rounded-xl py-3 text-center text-sm ${soldOut ? "bg-gray-100 text-gray-500" : "bg-black text-white"}`}
        >
          {soldOut ? "예약 마감" : "선택하기"}
        </span>
      </div>
    </button>
  );
}
