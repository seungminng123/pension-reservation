import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import {
  getAdminRoomPrices,
  resetAdminRoomPrices,
  setAdminRoomPrices,
} from "@/api/admin";
import { getRoom } from "@/api/room";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDatesBetween = (start: string, end: string) => {
  const dates: string[] = [];

  const startDate = new Date(`${start}T00:00:00`);

  const endDate = new Date(`${end}T00:00:00`);

  const current =
    startDate <= endDate ? new Date(startDate) : new Date(endDate);

  const last = startDate <= endDate ? endDate : startDate;

  while (current <= last) {
    dates.push(formatDate(current));

    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export default function AdminRoomPricingPage() {
  const { roomId } = useParams();

  const id = Number(roomId);

  const queryClient = useQueryClient();

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectionStart, setSelectionStart] = useState("");

  const [selectionEnd, setSelectionEnd] = useState("");

  const [price, setPrice] = useState("");

  const year = currentMonth.getFullYear();

  const month = currentMonth.getMonth() + 1;

  const { data: room } = useQuery({
    queryKey: ["room", id],
    queryFn: () => getRoom(id),
    enabled: Number.isFinite(id),
  });

  const { data: monthlyPrices, isLoading } = useQuery({
    queryKey: ["adminRoomPrices", id, year, month],

    queryFn: () => getAdminRoomPrices(id, year, month),

    enabled: Number.isFinite(id),
  });

  const priceMap = useMemo(
    () =>
      new Map((monthlyPrices?.prices ?? []).map((item) => [item.date, item])),
    [monthlyPrices],
  );

  const selectedDates = useMemo(() => {
    if (!selectionStart) {
      return [];
    }

    if (!selectionEnd) {
      return [selectionStart];
    }

    return getDatesBetween(selectionStart, selectionEnd);
  }, [selectionStart, selectionEnd]);

  const firstDay = new Date(year, month - 1, 1).getDay();

  const lastDate = new Date(year, month, 0).getDate();

  const dates = Array.from(
    {
      length: lastDate,
    },
    (_, index) => new Date(year, month - 1, index + 1),
  );

  const clearSelection = () => {
    setSelectionStart("");
    setSelectionEnd("");
    setPrice("");
  };

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["adminRoomPrices", id],
    });

    await queryClient.invalidateQueries({
      queryKey: ["roomAvailability", id],
    });
  };

  const setPriceMutation = useMutation({
    mutationFn: () =>
      setAdminRoomPrices(id, {
        dates: selectedDates,
        price: Number(price),
      }),

    onSuccess: async () => {
      await refresh();

      clearSelection();
    },
  });

  const resetPriceMutation = useMutation({
    mutationFn: () =>
      resetAdminRoomPrices(id, {
        dates: selectedDates,
      }),

    onSuccess: async () => {
      await refresh();

      clearSelection();
    },
  });

  const handleDateClick = (date: string) => {
    if (!selectionStart || selectionEnd) {
      setSelectionStart(date);
      setSelectionEnd("");
      setPrice("");

      return;
    }

    setSelectionEnd(date);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 2, 1));

    clearSelection();
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month, 1));

    clearSelection();
  };

  const isSelected = (date: string) => selectedDates.includes(date);

  const handleApplyPrice = () => {
    if (selectedDates.length === 0) {
      alert("가격을 설정할 날짜를 선택해 주세요.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("올바른 가격을 입력해 주세요.");
      return;
    }

    setPriceMutation.mutate();
  };

  const handleResetPrice = () => {
    if (selectedDates.length === 0) {
      return;
    }

    resetPriceMutation.mutate();
  };

  if (!room) {
    return <p>객실 정보를 불러오는 중입니다.</p>;
  }

  return (
    <div>
      <Link
        to="/admin/rooms"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-500"
      >
        <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" /> 객실 관리
      </Link>

      <div className="mt-5">
        <h2 className="text-2xl font-bold">{room.name} 요금 관리</h2>

        <p className="mt-2 text-sm text-gray-500">
          날짜를 선택한 뒤 해당 날짜에 적용할 1박 가격을 설정할 수 있습니다.
        </p>
      </div>

      {/* 기본 가격 */}
      <section className="mt-8 rounded-2xl border bg-white p-5">
        <p className="text-sm text-gray-500">객실 기본 가격</p>

        <p className="mt-1 text-2xl font-bold">
          {room.price.toLocaleString()}원
        </p>

        <p className="mt-2 text-xs text-gray-400">
          날짜별 가격을 별도로 설정하지 않은 날짜에는 기본 가격이 적용됩니다.
        </p>
      </section>

      {/* 요금 달력 */}
      <section className="mt-6 rounded-2xl border bg-white p-2 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 달"
            onClick={handlePreviousMonth}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
          >
            <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </button>

          <h3 className="font-bold">
            {year}년 {month}월
          </h3>

          <button
            type="button"
            aria-label="다음 달"
            onClick={handleNextMonth}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
          >
            <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
          <span>일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span>토</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            요금을 불러오는 중입니다.
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({
              length: firstDay,
            }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-20" />
            ))}

            {dates.map((date) => {
              const dateString = formatDate(date);

              const priceInfo = priceMap.get(dateString);

              const selected = isSelected(dateString);

              return (
                <button
                  key={dateString}
                  type="button"
                  onClick={() => handleDateClick(dateString)}
                  className={[
                    "relative flex min-w-0 min-h-20 py-2 flex-col items-center justify-center rounded-xl border text-center transition",

                    selected
                      ? "border-black bg-black text-white"
                      : "border-transparent hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span className="text-sm font-semibold">
                    {date.getDate()}
                  </span>

                  <span
                    className={[
                      "mt-1 max-w-full text-[9px] leading-tight font-medium [overflow-wrap:anywhere] sm:text-xs",

                      selected
                        ? "text-white"
                        : priceInfo?.customPrice
                          ? "text-blue-600"
                          : "text-gray-500",
                    ].join(" ")}
                  >
                    <span className="sm:hidden">
                      {(priceInfo?.price ?? room.price) >= 10000
                        ? `${((priceInfo?.price ?? room.price) / 10000).toLocaleString("ko-KR", { maximumFractionDigits: 4 })}만`
                        : `${(priceInfo?.price ?? room.price).toLocaleString()}원`}
                    </span>
                    <span className="hidden sm:inline">
                      {(priceInfo?.price ?? room.price).toLocaleString()}원
                    </span>
                  </span>

                  {priceInfo?.customPrice && !selected && (
                    <span className="mt-1 text-[9px] text-blue-500">
                      설정됨
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3 sm:gap-5 border-t pt-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-black" />
            선택 날짜
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-100" />
            별도 요금 설정
          </div>
        </div>
      </section>

      {/* 선택 가격 설정 */}
      {selectedDates.length > 0 && (
        <section className="mt-6 rounded-2xl border bg-white p-4 shadow-lg sm:sticky sm:bottom-5 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bold">선택한 날짜</h3>

              <p className="mt-1 text-sm text-gray-500">
                {selectionStart}

                {selectionEnd && ` ~ ${selectionEnd}`}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                총 {selectedDates.length}일 선택
              </p>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-500"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" /> 선택 해제
            </button>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium">적용할 1박 가격</label>

            <div className="relative mt-2">
              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="예: 250000"
                className="min-w-0 w-full rounded-xl border px-4 py-4 pr-12 outline-none focus:border-black"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                원
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleResetPrice}
              disabled={resetPriceMutation.isPending}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 border py-3 text-sm font-medium"
            >
              <RotateCcw size={20} strokeWidth={2} aria-hidden="true" /> 기본
              가격으로 되돌리기
            </button>

            <button
              type="button"
              onClick={handleApplyPrice}
              disabled={setPriceMutation.isPending}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 bg-black py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {setPriceMutation.isPending ? "저장 중..." : "선택 날짜에 적용"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
