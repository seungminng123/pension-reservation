import { getRoomImageUrl } from "@/api/room";

import type { AvailableRoom } from "@/types/room";

type AvailableRoomCardProps = {
  room: AvailableRoom;
  onSelect: () => void;
};

export default function AvailableRoomCard({
  room,
  onSelect,
}: AvailableRoomCardProps) {
  const soldOut = !room.available || room.remainingCount <= 0;

  const unitLabel = room.type === "ROOM" ? "박" : "일";

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={onSelect}
      className="min-w-0 overflow-hidden rounded-2xl border bg-white text-left transition enabled:hover:border-black enabled:hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      {/* 대표 이미지 */}
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
        {/* 상품 종류 */}
        <p className="text-xs font-medium text-gray-400">
          {room.type === "ROOM" ? "방" : "평상"}
        </p>

        {/* 상품명 */}
        <h3 className="text-lg font-bold">{room.name}</h3>

        {/* 인원 */}
        <p className="text-sm text-gray-500">
          기준 {room.guestCount}명 · 최대 {room.maxGuests}명
        </p>

        {/* 기본 가격 */}
        <p className="text-sm text-gray-600">
          기본 {room.price.toLocaleString()}원 / {unitLabel}
        </p>

        {/* 선택 기간 가격 */}
        <p className="font-semibold">
          선택 기간 {room.totalPrice.toLocaleString()}원
        </p>

        {/* 재고 */}
        <p
          className={`text-sm font-medium ${
            soldOut ? "text-red-500" : "text-green-600"
          }`}
        >
          {soldOut ? "예약 마감" : `잔여 ${room.remainingCount}개`}
        </p>

        {/* 선택 버튼 */}
        <span
          className={`mt-3 block rounded-xl py-3 text-center text-sm font-semibold ${
            soldOut ? "bg-gray-100 text-gray-400" : "bg-black text-white"
          }`}
        >
          {soldOut ? "예약 마감" : "선택하기"}
        </span>
      </div>
    </button>
  );
}
