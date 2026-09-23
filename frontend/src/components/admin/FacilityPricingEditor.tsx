import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRooms,
  getAdminRoomPrices,
  setAdminRoomPrices,
  resetAdminRoomPrices,
} from "@/api/admin";
import MonthNavigation from "@/components/common/MonthNavigation";
import Modal from "@/components/common/Modal";
import { LoadingRows, QueryError } from "@/components/admin/QueryFeedback";
import { monthDates } from "@/utils/date";
import type { AdminRoom } from "@/types/admin";
import type { RoomType } from "@/types/room";
type PriceJob = {
  ids: number[];
  dates: string[];
  kind: "apply" | "reset";
  price: number;
};
export default function FacilityPricingEditor({
  initialRoomId,
}: {
  initialRoomId?: number;
}) {
  const rooms = useQuery({ queryKey: ["adminRooms"], queryFn: getAdminRooms });
  if (rooms.isLoading) return <LoadingRows />;
  if (rooms.isError) return <QueryError onRetry={() => void rooms.refetch()} />;
  if (
    initialRoomId &&
    !rooms.data?.some((room) => room.roomId === initialRoomId)
  )
    return (
      <p className="p-5 text-sm text-slate-500">시설을 찾을 수 없습니다.</p>
    );
  return <PricingForm rooms={rooms.data ?? []} initialRoomId={initialRoomId} />;
}
function PricingForm({
  rooms,
  initialRoomId,
}: {
  rooms: AdminRoom[];
  initialRoomId?: number;
}) {
  const client = useQueryClient();
  const initial = rooms.find((room) => room.roomId === initialRoomId);
  const [type, setType] = useState<RoomType>(initial?.type ?? "ROOM");
  const [ids, setIds] = useState<number[]>(initial ? [initial.roomId] : []);
  const [dates, setDates] = useState<string[]>([]);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [price, setPrice] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(
    initial?.roomId ?? null,
  );
  const [confirm, setConfirm] = useState<PriceJob | null>(null);
  const [progress, setProgress] = useState(0);
  const units = rooms
    .filter((room) => room.type === type)
    .sort((a, b) => a.name.localeCompare(b.name, "ko", { numeric: true }));
  const selected = units.filter((room) => ids.includes(room.roomId));
  const preview =
    selected.find((room) => room.roomId === previewId) ?? selected[0];
  const year = month.getFullYear(),
    monthNumber = month.getMonth() + 1;
  const prices = useQuery({
    queryKey: ["adminRoomPrices", preview?.roomId, year, monthNumber],
    queryFn: () => getAdminRoomPrices(preview!.roomId, year, monthNumber),
    enabled: !!preview,
  });
  const priceMap = new Map(
    prices.data?.prices.map((item) => [item.date, item]),
  );
  const batch = useMutation({
    mutationFn: async (job: PriceJob) => {
      const succeeded: number[] = [],
        failed: number[] = [];
      let index = 0,
        completed = 0;
      setProgress(0);
      await Promise.all(
        Array.from({ length: Math.min(3, job.ids.length) }, async () => {
          while (index < job.ids.length) {
            const id = job.ids[index++];
            try {
              if (job.kind === "apply")
                await setAdminRoomPrices(id, {
                  dates: job.dates,
                  price: job.price,
                });
              else await resetAdminRoomPrices(id, { dates: job.dates });
              succeeded.push(id);
            } catch {
              failed.push(id);
            } finally {
              setProgress(++completed);
            }
          }
        }),
      );
      return { job, succeeded, failed };
    },
    onSuccess: async () => {
      await Promise.all(
        [
          "adminRoomPrices",
          "roomAvailability",
          "roomAvailabilityCheck",
          "availableRooms",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
      setConfirm(null);
    },
  });
  const busy = batch.isPending;
  const toggleDate = (date: string) => {
    batch.reset();
    setDates((current) =>
      current.includes(date)
        ? current.filter((value) => value !== date)
        : [...current, date].sort(),
    );
  };
  const numericPrice = Number(price);
  const canApply =
    selected.length > 0 &&
    dates.length > 0 &&
    Number.isSafeInteger(numericPrice) &&
    numericPrice > 0;
  const job = (kind: PriceJob["kind"]): PriceJob => ({
    ids: selected.map((room) => room.roomId),
    dates: [...dates].sort(),
    kind,
    price: numericPrice,
  });
  const basePrices = selected.map((room) => room.price);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">가격 관리</h2>
        <p className="mt-1 text-sm text-slate-500">
          여러 시설과 개별 날짜를 선택해 특별 가격을 한 번에 설정하세요.
        </p>
      </div>
      <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
        <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-3 font-semibold">적용할 시설</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["ROOM", "PYEONGSANG"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={type === value}
                onClick={() => {
                  setType(value);
                  setIds([]);
                  setPreviewId(null);
                  batch.reset();
                }}
                className={`min-h-11 rounded-lg border px-4 text-sm ${type === value ? "border-slate-500 bg-slate-100 text-slate-900 font-semibold" : "border-slate-300"}`}
              >
                {value === "ROOM" ? "방" : "평상"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setIds(units.map((room) => room.roomId));
                batch.reset();
              }}
              className="ml-auto min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={() => {
                setIds([]);
                batch.reset();
              }}
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
            >
              전체 해제
            </button>
          </div>
          <div
            className={`grid gap-2 ${type === "ROOM" ? "grid-cols-4 lg:grid-cols-8" : "grid-cols-5 lg:grid-cols-10"}`}
          >
            {units.map((room) => (
              <button
                key={room.roomId}
                type="button"
                aria-label={`${room.name} 선택`}
                aria-pressed={ids.includes(room.roomId)}
                onClick={() => {
                  setIds((current) =>
                    current.includes(room.roomId)
                      ? current.filter((id) => id !== room.roomId)
                      : [...current, room.roomId],
                  );
                  batch.reset();
                }}
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-md border px-1 py-2 ${ids.includes(room.roomId) ? "border-slate-500 bg-slate-100 text-slate-900 font-semibold" : "border-slate-300 bg-white"}`}
              >
                <span className="text-base font-bold">
                  {room.name.match(/\d+/)?.[0] ?? room.name}
                </span>
                <span className="text-[10px]">
                  {ids.includes(room.roomId) ? "선택됨" : "선택"}
                </span>
              </button>
            ))}
          </div>
          {!units.length && (
            <p className="py-5 text-sm text-slate-500">
              등록된 시설이 없습니다.
            </p>
          )}
          <p className="mt-3 text-sm text-slate-500">
            선택 시설 {selected.length}개 / 전체 {units.length}개
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold">기본 가격</h3>
          <p className="mt-2 text-xl font-bold">
            {basePrices.length
              ? Math.min(...basePrices) === Math.max(...basePrices)
                ? `${basePrices[0].toLocaleString()}원`
                : `${Math.min(...basePrices).toLocaleString()} ~ ${Math.max(...basePrices).toLocaleString()}원`
              : "시설을 선택해 주세요"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            특별 가격이 없는 날짜에는 각 시설의 기본 가격이 적용됩니다. 기본
            가격은 객실 관리에서 수정합니다.
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-3 sm:p-5">
          <h3 className="mb-3 font-semibold">날짜 선택 · 개별 다중 선택</h3>
          <p className="mb-4 text-sm text-slate-500">
            원하는 날짜만 선택하세요. 다시 누르면 해제되며, 달을 바꿔도 선택은
            유지됩니다.
          </p>
          {preview && (
            <label className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              달력에 표시할 시설
              <select
                aria-label="가격 미리보기 시설"
                value={preview.roomId}
                onChange={(event) => setPreviewId(Number(event.target.value))}
                className="min-h-11 rounded-lg border border-slate-300 px-3"
              >
                {selected.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">
                이 시설의 기본 가격과 다른 특별 가격만 표시합니다.
              </span>
            </label>
          )}
          <MonthNavigation month={month} onChange={setMonth} />
          {preview && prices.isError && (
            <QueryError
              message="표시할 요금을 불러오지 못했습니다."
              onRetry={() => void prices.refetch()}
            />
          )}
          {preview && prices.isFetching && (
            <p role="status" className="mt-3 text-xs text-slate-500">
              요금을 불러오는 중입니다.
            </p>
          )}
          <div className="mt-4 grid grid-cols-7 gap-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span
                key={day}
                className="py-2 text-center text-xs text-slate-500"
              >
                {day}
              </span>
            ))}
            {Array.from({ length: month.getDay() }, (_, i) => (
              <div key={i} />
            ))}
            {monthDates(month).map((date) => {
              const info = priceMap.get(date),
                active = dates.includes(date);
              return (
                <button
                  key={date}
                  type="button"
                  aria-label={`가격 날짜 ${date}`}
                  aria-pressed={active}
                  onClick={() => toggleDate(date)}
                  className={`flex min-h-20 min-w-0 flex-col items-center justify-center rounded-md border px-0.5 py-2 ${active ? "border-slate-500 bg-slate-100 text-slate-900 font-semibold" : "border-slate-200 bg-white"}`}
                >
                  <span className="text-sm font-semibold">
                    {Number(date.slice(-2))}
                  </span>
                  {preview &&
                    !prices.isFetching &&
                    !prices.isError &&
                    info &&
                    info.price !==
                      (prices.data?.defaultPrice ?? preview.price) && (
                      <>
                        <span className="mt-1 text-[9px] sm:text-xs">
                          {info.price.toLocaleString()}원
                        </span>
                        <span className={`mt-1 text-[9px] text-blue-700`}>
                          특별 가격
                        </span>
                      </>
                    )}
                </button>
              );
            })}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap justify-between gap-2">
            <h3 className="font-semibold">선택 날짜 특별 가격</h3>
            <button
              type="button"
              disabled={!dates.length}
              onClick={() => {
                setDates([]);
                batch.reset();
              }}
              className="min-h-10 text-sm text-slate-500 underline disabled:opacity-40"
            >
              날짜 전체 해제
            </button>
          </div>
          <p className="mt-2 text-sm">
            선택한 시설 {selected.length}개 · 선택한 날짜 {dates.length}일
          </p>
          <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                aria-label={`${date} 선택 해제`}
                onClick={() => toggleDate(date)}
                className="min-h-9 rounded border border-slate-300 px-2 text-xs"
              >
                {date} ×
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium">
            적용 가격 (원)
            <input
              aria-label="특별 가격"
              type="number"
              min={1}
              step={1}
              value={price}
              onChange={(event) => {
                setPrice(event.target.value);
                batch.reset();
              }}
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3"
            />
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!selected.length || !dates.length}
              onClick={() => setConfirm(job("reset"))}
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm disabled:opacity-40"
            >
              기본 가격으로 초기화
            </button>
            <button
              type="button"
              disabled={!canApply}
              onClick={() => setConfirm(job("apply"))}
              className="min-h-11 flex-1 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              선택한 시설 · 날짜에 가격 적용
            </button>
          </div>
        </section>
      </fieldset>
      {busy && (
        <p role="status" className="text-sm">
          처리 중 {progress} / {batch.variables?.ids.length}개 시설
        </p>
      )}
      {batch.data && !busy && (
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-white p-4 text-sm"
        >
          <p>
            {batch.data.job.kind === "apply"
              ? "특별 가격 적용"
              : "기본 가격 초기화"}
            : 성공 {batch.data.succeeded.length}개 · 실패{" "}
            {batch.data.failed.length}개
          </p>
          <p className="mt-1 text-slate-500">
            처리 날짜: {batch.data.job.dates.join(", ")}
          </p>
          {batch.data.failed.length > 0 && (
            <>
              <p className="mt-2 text-red-700">
                실패 시설:{" "}
                {batch.data.failed
                  .map(
                    (id) =>
                      rooms.find((room) => room.roomId === id)?.name ?? id,
                  )
                  .join(", ")}
              </p>
              <button
                type="button"
                onClick={() =>
                  batch.mutate({ ...batch.data!.job, ids: batch.data!.failed })
                }
                className="mt-3 min-h-11 rounded-lg border border-slate-300 px-3"
              >
                실패한 시설만 재시도
              </button>
            </>
          )}
        </div>
      )}
      {confirm && (
        <Modal
          title={
            confirm.kind === "apply"
              ? "특별 가격 적용 확인"
              : "기본 가격 초기화 확인"
          }
          busy={busy}
          onClose={() => setConfirm(null)}
        >
          <p className="text-sm leading-6">
            {confirm.ids.length}개 시설의 선택한 {confirm.dates.length}일만{" "}
            {confirm.kind === "apply"
              ? `${confirm.price.toLocaleString()}원으로 변경합니다.`
              : "각 시설의 기본 가격으로 초기화합니다."}
          </p>
          <p className="mt-3 text-sm">
            {confirm.ids
              .map((id) => rooms.find((room) => room.roomId === id)?.name)
              .join(", ")}
          </p>
          <p className="mt-2 max-h-32 overflow-y-auto text-xs text-slate-500">
            {confirm.dates.join(", ")}
          </p>
          {busy && (
            <p role="status" className="mt-4 text-sm">
              처리 중 {progress} / {confirm.ids.length}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirm(null)}
              className="min-h-11 flex-1 rounded-lg border border-slate-300"
            >
              취소
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => batch.mutate(confirm)}
              className="min-h-11 flex-1 rounded-lg bg-slate-900 text-white disabled:opacity-40"
            >
              {busy ? "처리 중..." : "확인 후 적용"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
