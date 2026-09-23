import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronRight, List, CalendarDays } from "lucide-react";
import { searchAdminReservations } from "@/api/admin";
import AdminReservationCalendar from "@/components/admin/AdminReservationCalendar";
import ReservationDetailDrawer from "@/components/admin/ReservationDetailDrawer";
import ReservationStatusBadge from "@/components/admin/ReservationStatusBadge";
import { QueryError, LoadingRows } from "@/components/admin/QueryFeedback";
import { scheduleLabel } from "@/utils/adminReservation";
import { isValidDate } from "@/utils/date";
import type { ReservationStatus } from "@/types/reservation";
const statusOptions: { value: ReservationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "입금 확인 대기" },
  { value: "CONFIRMED", label: "예약 확정" },
  { value: "CANCEL_REQUESTED", label: "취소 요청" },
  { value: "CANCELED", label: "취소 완료" },
];
export default function AdminReservationsPage() {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const status =
    statusOptions.find((option) => option.value === params.get("status"))
      ?.value ?? "ALL";
  const date = params.get("date") ?? "";
  const search = params.get("q") ?? "";
  const pageValue = Number(params.get("page"));
  const page = Number.isFinite(pageValue)
    ? Math.max(1, Math.floor(pageValue))
    : 1;
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  };
  const normalizedSearch = search.trim();
  const [debouncedSearch, setDebouncedSearch] = useState(normalizedSearch);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(normalizedSearch),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [normalizedSearch]);
  const searchPending = normalizedSearch !== debouncedSearch;
  const searchParams = {
    q: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
    date: isValidDate(date) ? date : undefined,
    page: page - 1,
    size: 20,
  };
  const list = useQuery({
    queryKey: ["adminReservations", searchParams],
    queryFn: () => searchAdminReservations(searchParams),
    enabled: !searchPending,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });
  const updating = searchPending || list.isFetching || list.isPlaceholderData;
  const totalPages = list.data?.totalPages ?? 0;
  const currentPage = (list.data?.page ?? page - 1) + 1;
  const rows = list.data?.items ?? [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">예약 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            검색과 필터로 예약을 찾고 상세 패널에서 처리하세요.
          </p>
        </div>
      </div>
      <div
        className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-1"
        role="group"
        aria-label="예약 보기 방식"
      >
        {[
          { calendar: false, label: "목록", icon: List },
          { calendar: true, label: "월간 달력", icon: CalendarDays },
        ].map(({ calendar, label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            aria-pressed={calendarOpen === calendar}
            onClick={() => setCalendarOpen(calendar)}
            className={
              "inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm " +
              (calendarOpen === calendar
                ? "border-slate-500 bg-slate-100 font-semibold text-slate-900"
                : "border-transparent text-slate-500 hover:bg-slate-50")
            }
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      <div hidden={!calendarOpen}>
        {calendarOpen && <AdminReservationCalendar onSelect={setSelected} />}
      </div>
      <div hidden={calendarOpen} className="space-y-5">
        <section
          aria-label="예약 검색 및 필터"
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                aria-label="예약자명, 전화번호, 예약번호 검색"
                value={search}
                onChange={(event) => setFilter("q", event.target.value)}
                placeholder="예약자명 · 전화번호 · 예약번호"
                className="min-h-11 w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              이용일
              <input
                aria-label="이용일 필터"
                type="date"
                value={date}
                onChange={(event) => setFilter("date", event.target.value)}
                className="min-h-11 min-w-0 rounded-lg border border-slate-300 px-2"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={status === value}
                onClick={() => setFilter("status", value)}
                className={`min-h-10 rounded-lg border px-3 text-sm ${status === value ? "border-slate-500 bg-slate-100 text-slate-900 font-semibold" : "border-slate-200 text-slate-600"}`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="ml-auto min-h-10 px-2 text-sm text-slate-500 underline"
            >
              초기화
            </button>
          </div>
        </section>
        {list.isError && <QueryError onRetry={() => void list.refetch()} />}
        <p role="status" className="text-sm text-slate-500">
          검색 결과 {list.data?.totalElements ?? 0}건
          {updating
            ? list.data
              ? " · 이전 결과 표시 중 · 검색 결과 갱신 중..."
              : " · 불러오는 중..."
            : ""}
        </p>
        {list.isPending ? (
          <LoadingRows />
        ) : (
          !list.isError && (
            <section
              aria-label="예약 목록"
              aria-busy={updating}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <div className="hidden grid-cols-[1.2fr_1fr_1.4fr_1fr_1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500 xl:grid">
                <span>시설 / 예약번호</span>
                <span>예약자 / 인원</span>
                <span>이용 일정</span>
                <span>입금자 / 예약금</span>
                <span>상태</span>
              </div>
              {rows.map((item) => {
                return (
                  <button
                    key={item.reservationId}
                    type="button"
                    disabled={updating}
                    onClick={() => setSelected(item.reservationId)}
                    className="group disabled:opacity-60 disabled:cursor-wait relative grid w-full cursor-pointer gap-3 border-b border-slate-100 p-4 pr-10 text-left text-sm last:border-0 hover:bg-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slate-500 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1.4fr_1fr_1fr] xl:items-center"
                  >
                    <ChevronRight
                      size={18}
                      aria-hidden="true"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-900"
                    />
                    <span className="sr-only">예약 상세 보기: </span>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {item.roomName} · {item.quantity}개
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {item.reservationNumber}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {item.guestName}{" "}
                        <span className="text-slate-500">
                          {item.guestCount}명
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.phoneNumber}
                      </p>
                    </div>
                    <p className="text-xs leading-5 text-slate-600">
                      {scheduleLabel(
                        item.roomType,
                        item.checkIn,
                        item.checkOut,
                      )}
                    </p>
                    <div>
                      <p className="text-xs text-slate-500">
                        입금자 {item.depositorName}
                      </p>
                      <p className="mt-1 font-medium">
                        {item.depositAmount.toLocaleString()}원
                      </p>
                    </div>
                    <div>
                      <ReservationStatusBadge status={item.status} />
                    </div>
                  </button>
                );
              })}
              {!rows.length && (
                <p className="p-10 text-center text-sm text-slate-500">
                  {updating
                    ? "검색 결과를 불러오고 있습니다."
                    : "조건에 맞는 예약이 없습니다."}
                </p>
              )}
            </section>
          )
        )}
        {!list.isError && (totalPages > 1 || currentPage > 1) && (
          <nav
            aria-label="예약 목록 페이지"
            className="flex items-center justify-center gap-4"
          >
            <button
              disabled={updating || list.data?.first !== false}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(currentPage - 1));
                setParams(next);
              }}
              className="min-h-10 rounded-lg border bg-white px-3 disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={updating || list.data?.last !== false}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(currentPage + 1));
                setParams(next);
              }}
              className="min-h-10 rounded-lg border bg-white px-3 disabled:opacity-40"
            >
              다음
            </button>
          </nav>
        )}
      </div>
      {selected !== null && (
        <ReservationDetailDrawer
          key={selected}
          reservationId={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
