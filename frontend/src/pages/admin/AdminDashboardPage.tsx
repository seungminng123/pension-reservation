import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { getAdminReservationsByDate, getAdminRooms } from "@/api/admin";
import AdminReservationNumberGrid from "@/components/admin/AdminReservationNumberGrid";
import ReservationDateSelector from "@/components/admin/ReservationDateSelector";
import ReservationDetailDrawer from "@/components/admin/ReservationDetailDrawer";
import ReservationStatusBadge, {
  ReservationStatusLegend,
} from "@/components/admin/ReservationStatusBadge";
import { LoadingRows, QueryError } from "@/components/admin/QueryFeedback";
import Modal from "@/components/common/Modal";
import { formatDate } from "@/utils/date";
import { facilityState } from "@/utils/adminReservation";
export default function AdminDashboardPage() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [selected, setSelected] = useState<number | null>(null);
  const [facility, setFacility] = useState<number | null>(null);
  const rooms = useQuery({
    queryKey: ["adminRooms"],
    queryFn: getAdminRooms,
    refetchOnWindowFocus: true,
  });
  const reservations = useQuery({
    queryKey: ["adminReservationsByDate", date],
    queryFn: () => getAdminReservationsByDate(date),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });
  const stale = reservations.isPlaceholderData;
  const items = reservations.data ?? [];
  const units = (rooms.data ?? []).map((room) => {
    const state = facilityState(room, items);
    return { ...room, ...state, reservationCount: state.items.length };
  });
  const available = units.reduce((sum, item) => sum + item.remaining, 0);
  const chosen = units.find((unit) => unit.roomId === facility);
  const today = date === formatDate(new Date());
  const cards = [
    [today ? "오늘 전체 예약" : "선택일 전체 예약", items.length, "ALL"],
    [
      "입금 확인 대기",
      items.filter((item) => item.status === "PENDING").length,
      "PENDING",
    ],
    [
      "예약 확정",
      items.filter((item) => item.status === "CONFIRMED").length,
      "CONFIRMED",
    ],
  ] as const;
  const loading = rooms.isLoading || reservations.isLoading;
  const failed = rooms.isError || reservations.isError;
  const retry = () => {
    void rooms.refetch();
    void reservations.refetch();
  };
  const selectFacility = (roomId: number) => {
    const unit = units.find((item) => item.roomId === roomId);
    if (unit?.items.length === 1) setSelected(unit.items[0].reservationId);
    else setFacility(roomId);
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">운영 현황</h2>
          <p className="mt-1 text-sm text-slate-500">
            오늘의 이용 시설과 처리할 예약을 확인하세요.
          </p>
        </div>
        <button
          type="button"
          disabled={rooms.isFetching || reservations.isFetching}
          onClick={retry}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-40"
        >
          <RefreshCw size={15} />
          새로고침
        </button>
      </div>
      <ReservationDateSelector
        date={date}
        onChange={(next) => {
          setDate(next);
          setFacility(null);
        }}
      />
      {failed && <QueryError onRetry={retry} />}
      {loading ? (
        <LoadingRows />
      ) : (
        !failed && (
          <div aria-busy={stale}>
            <p role="status" className="mb-2 min-h-5 text-xs text-slate-500">
              {stale
                ? "선택한 날짜의 현황을 불러오는 중입니다. 이전 날짜가 표시됩니다."
                : reservations.isFetching
                  ? "최신 예약을 확인하고 있습니다."
                  : `${date} 이용 기준 · 체크아웃 당일 제외`}
            </p>
            <div
              className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${stale ? "opacity-50" : ""}`}
            >
              {cards.map(([label, count, status]) => (
                <Link
                  key={status}
                  to={`/admin/reservations?date=${date}&status=${status}`}
                  aria-disabled={stale}
                  tabIndex={stale ? -1 : 0}
                  onClick={(event) => {
                    if (stale) event.preventDefault();
                  }}
                  className={`rounded-lg border p-4 ${status === "PENDING" ? "border-yellow-300 bg-yellow-50" : status === "CONFIRMED" ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}
                >
                  <p className="text-xs font-medium text-slate-600">{label}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums">
                    {count}
                    <span className="ml-1 text-sm font-normal text-slate-500">
                      건
                    </span>
                  </p>
                </Link>
              ))}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-600">
                  {today ? "오늘" : "선택일"} 이용 가능
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {available}
                  <span className="ml-1 text-sm font-normal text-slate-500">
                    개
                  </span>
                </p>
              </div>
            </div>
            <div className="my-5">
              <ReservationStatusLegend />
            </div>
            <fieldset
              disabled={stale}
              className={`space-y-4 ${stale ? "opacity-50" : ""}`}
            >
              <AdminReservationNumberGrid
                title="객실"
                items={units.filter((unit) => unit.type === "ROOM")}
                onSelect={selectFacility}
              />
              <AdminReservationNumberGrid
                title="평상"
                items={units.filter((unit) => unit.type === "PYEONGSANG")}
                onSelect={selectFacility}
              />
            </fieldset>
            {!items.length && (
              <p className="mt-4 rounded-lg border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                해당 날짜에는 예약이 없습니다.
              </p>
            )}
            {items.length > 0 && (
              <section className="mt-5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                  <h3 className="font-semibold">
                    {today ? "오늘" : "선택일"} 예약 목록
                  </h3>
                  <Link
                    to={`/admin/reservations?date=${date}`}
                    className="text-sm underline"
                  >
                    전체 보기
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {[...items]
                    .sort(
                      (a, b) =>
                        Number(
                          b.status === "PENDING" ||
                            b.status === "CANCEL_REQUESTED",
                        ) -
                        Number(
                          a.status === "PENDING" ||
                            a.status === "CANCEL_REQUESTED",
                        ),
                    )
                    .map((item) => (
                      <button
                        key={item.reservationId}
                        type="button"
                        disabled={stale}
                        onClick={() => setSelected(item.reservationId)}
                        className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left text-sm hover:bg-slate-50"
                      >
                        <span>
                          <strong>{item.roomName}</strong>
                          <span className="ml-3 text-slate-600">
                            {item.guestName} · {item.quantity}개
                          </span>
                        </span>
                        <ReservationStatusBadge status={item.status} />
                      </button>
                    ))}
                </div>
              </section>
            )}
          </div>
        )
      )}
      {chosen && (
        <Modal title={chosen.name} onClose={() => setFacility(null)}>
          {chosen.items.length ? (
            <div className="space-y-2">
              {chosen.items.map((item) => (
                <button
                  key={item.reservationId}
                  type="button"
                  onClick={() => {
                    setFacility(null);
                    setSelected(item.reservationId);
                  }}
                  className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <span>
                    {item.guestName} · {item.quantity}개
                  </span>
                  <ReservationStatusBadge status={item.status} />
                </button>
              ))}
            </div>
          ) : (
            <ReservationStatusBadge status={chosen.status} />
          )}
        </Modal>
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
