import { ChevronLeft, ChevronRight } from "lucide-react";
export default function MonthNavigation({
  month,
  onChange,
  previousDisabled = false,
}: {
  month: Date;
  onChange: (month: Date) => void;
  previousDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        aria-label="이전 달"
        disabled={previousDisabled}
        onClick={() =>
          onChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
        }
        className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
      >
        <ChevronLeft size={20} />
      </button>
      <h3 className="font-bold">
        {month.getFullYear()}년 {month.getMonth() + 1}월
      </h3>
      <button
        type="button"
        aria-label="다음 달"
        onClick={() =>
          onChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
        }
        className="flex h-11 w-11 items-center justify-center rounded-full border"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
