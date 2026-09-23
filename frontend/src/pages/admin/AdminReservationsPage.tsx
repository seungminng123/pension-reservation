import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { getAdminReservations } from "@/api/admin";
import AdminReservationCalendar from "@/components/admin/AdminReservationCalendar";
import ReservationDetailDrawer from "@/components/admin/ReservationDetailDrawer";
import ReservationStatusBadge from "@/components/admin/ReservationStatusBadge";
import { QueryError, LoadingRows } from "@/components/admin/QueryFeedback";
import useAdminReservationDetails from "@/hooks/useAdminReservationDetails";
import { scheduleLabel } from "@/utils/adminReservation";
import { isValidDate } from "@/utils/date";
export default function AdminReservationsPage() {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const status = params.get("status") ?? "ALL";
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
  const list = useQuery({
    queryKey: ["adminReservations", "ALL"],
    queryFn: () => getAdminReservations(),
    refetchOnWindowFocus: true,
  });
  const candidates = (list.data ?? []).filter(
    (item) =>
      (status === "ALL" ||
        (status === "CANCELED"
          ? item.status === "CANCELED" || item.status === "CANCEL_REQUESTED"
          : item.status === status)) &&
      (!isValidDate(date) || (item.checkIn <= date && item.checkOut > date)),
  );
  const details = useAdminReservationDetails(
    candidates.map((item) => item.reservationId),
  );
  const needle = search.trim().toLocaleLowerCase();
  const filtered = candidates.filter((item) => {
    const detail = details.data?.details[item.reservationId];
    return (
      !needle ||
      item.guestName.toLocaleLowerCase().includes(needle) ||
      item.reservationNumber.toLocaleLowerCase().includes(needle) ||
      (detail &&
        (detail.phoneNumber.includes(needle) ||
          (/^[\d\s+()-]+$/.test(needle) &&
            !!needle.replace(/\D/g, "") &&
            detail.phoneNumber
              .replace(/\D/g, "")
              .includes(needle.replace(/\D/g, "")))))
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * 20, currentPage * 20);
  const pendingDetails = candidates.length > 0 && details.isFetching;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">예약 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            검색과 필터로 예약을 찾고 상세 패널에서 처리하세요.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen(!calendarOpen)}
          className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          {calendarOpen ? "월간 달력 닫기" : "월간 달력 보기"}
        </button>
      </div>
      {calendarOpen && <AdminReservationCalendar onSelect={setSelected} />}
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
          {[
            ["ALL", "전체"],
            ["PENDING", "입금 확인 대기"],
            ["CONFIRMED", "예약 확정"],
            ["CANCELED", "취소"],
            ["CANCEL_REQUESTED", "취소 요청"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setFilter("status", value)}
              className={`min-h-10 rounded-lg border px-3 text-sm ${status === value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600"}`}
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
      {(details.data?.failed.length ?? 0) > 0 && (
        <QueryError
          message="일부 예약의 상세 정보를 불러오지 못했습니다. 전화번호 검색 결과가 누락될 수 있습니다."
          onRetry={() => void details.refetch()}
        />
      )}
      <p role="status" className="text-sm text-slate-500">
        검색 결과 {filtered.length}건
        {pendingDetails ? " · 인원·입금 정보 및 전화번호 검색 준비 중..." : ""}
      </p>
      {list.isLoading ? (
        <LoadingRows />
      ) : (
        !list.isError && (
          <section
            aria-label="예약 목록"
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
              const detail = details.data?.details[item.reservationId];
              return (
                <button
                  key={item.reservationId}
                  type="button"
                  onClick={() => setSelected(item.reservationId)}
                  className="grid w-full gap-3 border-b border-slate-100 p-4 text-left text-sm last:border-0 hover:bg-slate-50 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1.4fr_1fr_1fr] xl:items-center"
                >
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
                        {detail ? `${detail.guestCount}명` : "인원 확인 중"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {detail?.phoneNumber ?? "상세에서 확인"}
                    </p>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">
                    {scheduleLabel(item.roomType, item.checkIn, item.checkOut)}
                  </p>
                  <div>
                    <p className="text-xs text-slate-500">
                      입금자 {detail?.depositorName ?? "확인 중"}
                    </p>
                    <p className="mt-1 font-medium">
                      {detail
                        ? `${detail.depositAmount.toLocaleString()}원`
                        : "예약금 확인 중"}
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
                {pendingDetails
                  ? "전화번호를 포함한 검색 정보를 확인하고 있습니다."
                  : "조건에 맞는 예약이 없습니다."}
              </p>
            )}
          </section>
        )
      )}
      {totalPages > 1 && (
        <nav
          aria-label="예약 목록 페이지"
          className="flex items-center justify-center gap-4"
        >
          <button
            disabled={currentPage <= 1}
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
            disabled={currentPage >= totalPages}
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
