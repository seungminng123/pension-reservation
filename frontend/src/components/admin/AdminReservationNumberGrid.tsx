import type { RoomType } from "@/types/room";
import {
  statusLabels,
  statusStyles,
  type FacilityStatus,
} from "@/utils/adminReservation";
export type ReservationUnitStatus = FacilityStatus;
export type ReservationUnitItem = {
  roomId: number;
  name: string;
  type: RoomType;
  status: FacilityStatus;
  remaining?: number;
  stockCount?: number;
  reservationCount?: number;
};
export default function AdminReservationNumberGrid({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: ReservationUnitItem[];
  onSelect: (roomId: number) => void;
}) {
  const sorted = [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "ko", { numeric: true }),
  );
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">
          {title}{" "}
          <span className="ml-1 text-sm font-normal text-slate-500">
            {items.length}개 시설
          </span>
        </h3>
        <span className="text-xs text-slate-500">번호를 눌러 예약 확인</span>
      </div>
      <div
        className={`grid gap-2 ${items[0]?.type === "ROOM" ? "grid-cols-4 lg:grid-cols-8" : "grid-cols-5 lg:grid-cols-10"}`}
      >
        {sorted.map((item) => (
          <button
            key={item.roomId}
            type="button"
            onClick={() => onSelect(item.roomId)}
            aria-label={`${item.name}, ${statusLabels[item.status]}${item.remaining !== undefined ? `, 잔여 ${item.remaining}개` : ""}`}
            className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${statusStyles[item.status]}`}
          >
            <strong className="text-lg tabular-nums">
              {item.name.match(/\d+/)?.[0] ?? item.name}
            </strong>
            <span className="text-[10px] sm:text-xs">
              {item.status === "PENDING"
                ? "입금 대기"
                : statusLabels[item.status]}
            </span>
            {(item.stockCount ?? 1) > 1 && (
              <span className="text-[10px]">
                잔여 {item.remaining}/{item.stockCount}
              </span>
            )}
            {(item.reservationCount ?? 0) > 1 && (
              <span className="text-[10px]">
                예약 {item.reservationCount}건
              </span>
            )}
          </button>
        ))}
      </div>
      {!items.length && (
        <p className="py-6 text-center text-sm text-slate-500">
          등록된 시설이 없습니다.
        </p>
      )}
    </section>
  );
}
