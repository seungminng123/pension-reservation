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
  compactMobile = false,
}: {
  title: string;
  items: ReservationUnitItem[];
  onSelect: (roomId: number) => void;
  compactMobile?: boolean;
}) {
  const sorted = [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "ko", { numeric: true }),
  );
  return (
    <section
      className={
        compactMobile
          ? "bg-white sm:rounded-lg sm:border sm:border-slate-200 sm:p-5"
          : "rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      }
    >
      <div
        className={`${compactMobile ? "mb-2 sm:mb-4" : "mb-4"} flex flex-wrap items-center justify-between gap-2`}
      >
        <h3
          className={
            compactMobile ? "text-sm font-bold sm:text-base" : "font-bold"
          }
        >
          {title}{" "}
          <span className="ml-1 text-sm font-normal text-slate-500">
            {compactMobile ? (
              <>
                <span className="sm:hidden">· {items.length}개</span>
                <span className="hidden sm:inline">{items.length}개 시설</span>
              </>
            ) : (
              <>{items.length}개 시설</>
            )}
          </span>
        </h3>
        <span
          className={`${compactMobile ? "hidden sm:inline" : ""} text-xs text-slate-500`}
        >
          번호를 눌러 예약 확인
        </span>
      </div>
      <div
        className={`grid ${compactMobile ? "gap-1 sm:gap-2" : "gap-2"} ${items[0]?.type === "ROOM" ? "grid-cols-4 lg:grid-cols-8" : "grid-cols-5 lg:grid-cols-10"}`}
      >
        {sorted.map((item) => (
          <button
            key={item.roomId}
            type="button"
            onClick={() => onSelect(item.roomId)}
            aria-label={`${item.name}, ${statusLabels[item.status]}${item.remaining !== undefined ? `, 잔여 ${item.remaining}개` : ""}`}
            className={`flex ${compactMobile ? "min-h-12 gap-0.5 py-1 sm:min-h-20 sm:gap-1 sm:py-2" : "min-h-20 gap-1 py-2"} min-w-0 flex-col items-center justify-center rounded-md border px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${statusStyles[item.status]}`}
          >
            <strong
              className={`${compactMobile ? "text-sm sm:text-lg" : "text-lg"} tabular-nums`}
            >
              {item.name.match(/\d+/)?.[0] ?? item.name}
            </strong>
            {compactMobile && (
              <span className="text-[10px] sm:hidden">
                {
                  {
                    AVAILABLE: "가능",
                    PENDING: "대기",
                    CONFIRMED: "확정",
                    CANCEL_REQUESTED: "취소 요청",
                    CANCELED: "취소",
                    CLOSED: "판매 중지",
                  }[item.status]
                }
              </span>
            )}
            <span
              className={`${compactMobile ? "hidden sm:inline" : ""} text-[10px] sm:text-xs`}
            >
              {item.status === "PENDING"
                ? "입금 대기"
                : statusLabels[item.status]}
            </span>
            {(item.stockCount ?? 1) > 1 && (
              <span
                className={`${compactMobile ? "hidden sm:inline" : ""} text-[10px]`}
              >
                잔여 {item.remaining}/{item.stockCount}
              </span>
            )}
            {(item.reservationCount ?? 0) > 1 && (
              <span
                className={`${compactMobile ? "hidden sm:inline" : ""} text-[10px]`}
              >
                예약 {item.reservationCount}건
              </span>
            )}
          </button>
        ))}
      </div>
      {!items.length && (
        <p
          className={`${compactMobile ? "py-2 sm:py-6" : "py-6"} text-center text-sm text-slate-500`}
        >
          등록된 시설이 없습니다.
        </p>
      )}
    </section>
  );
}
