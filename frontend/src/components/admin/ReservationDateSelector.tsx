import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, isValidDate } from "@/utils/date";
import { shiftDate } from "@/utils/adminReservation";
export default function ReservationDateSelector({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-0 items-center rounded-lg border border-slate-300 bg-white">
        <button
          type="button"
          aria-label="이전 날짜"
          onClick={() => onChange(shiftDate(date, -1))}
          className="flex h-11 w-10 items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>
        <label className="relative cursor-pointer px-1 text-sm font-semibold">
          <span>
            {new Date(`${date}T12:00:00`).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <input
            aria-label="조회 날짜"
            type="date"
            value={date}
            onClick={(event) => {
              try {
                event.currentTarget.showPicker();
              } catch {
                /* Native input remains available. */
              }
            }}
            onChange={(event) => {
              if (isValidDate(event.target.value)) onChange(event.target.value);
            }}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
        </label>
        <button
          type="button"
          aria-label="다음 날짜"
          onClick={() => onChange(shiftDate(date, 1))}
          className="flex h-11 w-10 items-center justify-center"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onChange(formatDate(new Date()))}
        className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium"
      >
        오늘
      </button>
    </div>
  );
}
