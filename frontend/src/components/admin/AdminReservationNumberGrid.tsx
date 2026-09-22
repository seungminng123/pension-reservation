import type { RoomType } from "@/types/room";

export type ReservationUnitStatus =
  "AVAILABLE" | "PENDING" | "CONFIRMED" | "CANCEL_REQUESTED";

export type ReservationUnitItem = {
  roomId: number;
  name: string;
  type: RoomType;
  status: ReservationUnitStatus;
};

type AdminReservationNumberGridProps = {
  title: string;
  items: ReservationUnitItem[];
  onSelect: (roomId: number) => void;
};

const getUnitNumber = (name: string) => {
  const match = name.match(/\d+/);

  return match ? Number(match[0]) : null;
};

const statusLabels: Record<ReservationUnitStatus, string> = {
  AVAILABLE: "예약 가능",
  PENDING: "입금 확인 대기",
  CONFIRMED: "예약 확정",
  CANCEL_REQUESTED: "취소 요청",
};
const getStatusClassName = (status: ReservationUnitStatus) => {
  switch (status) {
    case "AVAILABLE":
      return "border-gray-300 bg-white text-gray-700 hover:border-gray-500";

    case "PENDING":
      return "border-yellow-500 bg-yellow-300 text-yellow-950 hover:bg-yellow-400";

    case "CONFIRMED":
      return "border-green-500 bg-green-300 text-green-950 hover:bg-green-400";

    case "CANCEL_REQUESTED":
      return "border-red-600 bg-red-500 text-white hover:bg-red-600";

    default:
      return "border-gray-300 bg-white text-gray-700";
  }
};

export default function AdminReservationNumberGrid({
  title,
  items,
  onSelect,
}: AdminReservationNumberGridProps) {
  const availableCount = items.filter(
    (item) => item.status === "AVAILABLE",
  ).length;

  const pendingCount = items.filter((item) => item.status === "PENDING").length;

  const confirmedCount = items.filter(
    (item) => item.status === "CONFIRMED",
  ).length;

  const cancelRequestedCount = items.filter(
    (item) => item.status === "CANCEL_REQUESTED",
  ).length;

  const sortedItems = [...items].sort((a, b) => {
    const aNumber = getUnitNumber(a.name);
    const bNumber = getUnitNumber(b.name);

    if (aNumber === null && bNumber === null) {
      return a.roomId - b.roomId;
    }

    if (aNumber === null) return 1;
    if (bNumber === null) return -1;

    return aNumber - bNumber;
  });

  return (
    <section className="mt-6">
      {/* 제목 */}
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-bold">{title}</h4>

        <span className="text-[11px] text-gray-400">전체 {items.length}개</span>
      </div>

      {/* 숫자 카드 */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {sortedItems.map((item) => {
          const number = getUnitNumber(item.name);

          return (
            <button
              key={item.roomId}
              type="button"
              onClick={() => onSelect(item.roomId)}
              aria-label={`${item.name} ${statusLabels[item.status]}`}
              title={`${item.name} - ${statusLabels[item.status]}`}
              className={`flex h-8 min-w-0 items-center justify-center rounded-md border text-[11px] font-bold transition sm:h-10 sm:rounded-lg sm:text-xs ${getStatusClassName(
                item.status,
              )}`}
            >
              {number ?? item.name}
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-500">
        {/* 예약 가능 */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-gray-300 bg-white" />

          <span>예약 가능</span>

          <span className="text-gray-400">{availableCount}</span>
        </div>

        {/* 입금 확인 대기 */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-yellow-500 bg-yellow-300" />

          <span>입금 확인 대기</span>

          <span className="text-gray-400">{pendingCount}</span>
        </div>

        {/* 예약 확정 */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-green-500 bg-green-300" />

          <span>예약 확정</span>

          <span className="text-gray-400">{confirmedCount}</span>
        </div>

        {/* 취소 요청 */}
        {cancelRequestedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-red-500 bg-red-300" />

            <span>취소 요청</span>

            <span className="text-gray-400">{cancelRequestedCount}</span>
          </div>
        )}
      </div>
    </section>
  );
}
