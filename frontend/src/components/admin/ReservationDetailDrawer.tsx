import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CreditCard, Save } from "lucide-react";
import {
  getAdminReservation,
  confirmAdminReservation,
  cancelAdminReservation,
  updateAdminReservationMemo,
} from "@/api/admin";
import Modal from "@/components/common/Modal";
import ReservationStatusBadge from "@/components/admin/ReservationStatusBadge";
import { LoadingRows, QueryError } from "@/components/admin/QueryFeedback";
import { scheduleLabel } from "@/utils/adminReservation";
import type { PaymentMethod } from "@/types/reservation";
export default function ReservationDetailDrawer({
  reservationId,
  onClose,
}: {
  reservationId: number;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["adminReservation", reservationId],
    queryFn: () => getAdminReservation(reservationId),
  });
  const [action, setAction] = useState<"confirm" | "cancel" | "discard" | null>(
    null,
  );
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [memo, setMemo] = useState<string | null>(null);
  const data = query.data;
  const savedMemo = data?.adminMemo ?? "";
  const memoValue = memo ?? savedMemo;
  const changed = memoValue !== savedMemo;
  const refresh = async () => {
    await Promise.all(
      [
        "adminReservations",
        "adminReservation",
        "adminReservationDetails",
        "adminReservationCalendar",
        "adminReservationsByDate",
        "adminSettlements",
        "availableRooms",
        "roomAvailabilityCheck",
        "roomAvailability",
      ].map((key) => client.invalidateQueries({ queryKey: [key] })),
    );
  };
  const update = useMutation({
    mutationFn: async (
      request: { kind: "confirm"; payment: PaymentMethod } | { kind: "cancel" },
    ) =>
      request.kind === "confirm"
        ? confirmAdminReservation(reservationId, request.payment)
        : cancelAdminReservation(reservationId),
    onSuccess: async () => {
      await refresh();
      setAction(null);
      setPayment(null);
    },
  });
  const save = useMutation({
    mutationFn: (value: string) =>
      updateAdminReservationMemo(reservationId, value),
    onSuccess: async (updated) => {
      client.setQueryData(["adminReservation", reservationId], updated);
      setMemo(null);
      await client.invalidateQueries({ queryKey: ["adminReservationDetails"] });
    },
  });
  const busy = update.isPending || save.isPending;
  const close = () => {
    if (!busy) {
      if (changed) setAction("discard");
      else onClose();
    }
  };
  const fields = data
    ? [
        ["예약자", data.guestName],
        ["전화번호", data.phoneNumber],
        ["인원 / 수량", `${data.guestCount}명 / ${data.quantity}개`],
        [
          "이용 일정",
          scheduleLabel(data.roomType, data.checkIn, data.checkOut),
        ],
        ["입금자명", data.depositorName],
        ["예약금", `${data.depositAmount.toLocaleString()}원`],
        ["총 금액", `${data.totalPrice.toLocaleString()}원`],
        ["예약번호", data.reservationNumber],
      ]
    : [];
  return (
    <Modal title="예약 상세" variant="drawer" busy={busy} onClose={close}>
      {query.isLoading ? (
        <LoadingRows />
      ) : query.isError ? (
        <QueryError onRetry={() => void query.refetch()} />
      ) : (
        data && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  {data.roomType === "ROOM" ? "객실" : "평상"}
                </p>
                <h3 className="mt-1 text-xl font-bold">{data.roomName}</h3>
              </div>
              <ReservationStatusBadge status={data.status} />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-y border-slate-200 py-5">
              {fields.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium">
                    {label === "전화번호" ? (
                      <a
                        href={`tel:${value}`}
                        className="underline underline-offset-4"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {data.confirmedAt && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
                <p>
                  결제수단:{" "}
                  {data.paymentMethod === "CARD"
                    ? "카드"
                    : data.paymentMethod === "CASH"
                      ? "현금"
                      : "미등록"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  확정 {new Date(data.confirmedAt).toLocaleString("ko-KR")}
                </p>
              </div>
            )}
            <div className="mt-5">
              <label htmlFor="admin-memo" className="text-sm font-semibold">
                관리자 메모
              </label>
              <textarea
                id="admin-memo"
                value={memoValue}
                disabled={busy}
                maxLength={500}
                rows={3}
                onChange={(event) => {
                  setMemo(event.target.value);
                  save.reset();
                }}
                placeholder="차량, 도착 시간 등 운영에 필요한 내용을 기록하세요."
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {memoValue.length}/500
                </span>
                <button
                  type="button"
                  disabled={busy || !changed}
                  onClick={() => save.mutate(memoValue)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm disabled:opacity-40"
                >
                  <Save size={16} />
                  {save.isPending ? "저장 중" : "메모 저장"}
                </button>
              </div>
              {save.isSuccess && (
                <p role="status" className="mt-2 text-sm text-green-800">
                  메모가 저장되었습니다.
                </p>
              )}
              {save.isError && (
                <QueryError
                  message="메모 저장에 실패했습니다."
                  onRetry={() => save.mutate(memoValue)}
                />
              )}
            </div>
            <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-slate-200 bg-white py-4">
              {data.status === "PENDING" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    update.reset();
                    setPayment(null);
                    setAction("confirm");
                  }}
                  className="min-h-11 flex-1 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
                >
                  예약 확정
                </button>
              )}
              {data.status !== "CANCELED" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    update.reset();
                    setAction("cancel");
                  }}
                  className="min-h-11 flex-1 rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700 disabled:opacity-40"
                >
                  {data.status === "CANCEL_REQUESTED"
                    ? "취소 요청 처리"
                    : "예약 취소"}
                </button>
              )}
            </div>
          </>
        )
      )}
      {action && (
        <Modal
          title={
            action === "confirm"
              ? "예약 확정"
              : action === "cancel"
                ? "예약 취소"
                : "메모 변경사항"
          }
          busy={busy}
          onClose={() => setAction(null)}
        >
          <p className="text-sm leading-6">
            {action === "confirm"
              ? "정말 예약을 확정하시겠습니까? 입금 내역을 확인하고 결제 수단을 선택해 주세요."
              : action === "cancel"
                ? "예약을 취소하면 해당 예약의 수량이 반환되어 다시 예약할 수 있습니다. 정말 취소하시겠습니까?"
                : "저장하지 않은 메모가 있습니다. 변경사항을 버리고 닫으시겠습니까?"}
          </p>
          {data && action !== "discard" && (
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-medium">
              {data.roomName} · {data.guestName} · 예약금{" "}
              {data.depositAmount.toLocaleString()}원
            </p>
          )}
          {action === "confirm" && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["CARD", "CASH"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  disabled={busy}
                  aria-pressed={payment === method}
                  onClick={() => setPayment(method)}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-lg border ${payment === method ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}
                >
                  {method === "CARD" ? (
                    <CreditCard size={18} />
                  ) : (
                    <Banknote size={18} />
                  )}
                  {method === "CARD" ? "카드" : "현금"}
                </button>
              ))}
            </div>
          )}
          {update.isError && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              처리에 실패했습니다. 예약 상태를 확인하고 다시 시도해 주세요.
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setAction(null)}
              className="min-h-11 flex-1 rounded-lg border border-slate-300"
            >
              돌아가기
            </button>
            <button
              type="button"
              disabled={busy || (action === "confirm" && !payment)}
              onClick={() => {
                if (action === "discard") onClose();
                else if (action === "cancel") update.mutate({ kind: "cancel" });
                else if (payment) update.mutate({ kind: "confirm", payment });
              }}
              className={`min-h-11 flex-1 rounded-lg px-3 font-medium text-white disabled:opacity-40 ${action === "cancel" ? "bg-red-700" : "bg-slate-900"}`}
            >
              {busy
                ? "처리 중..."
                : action === "confirm"
                  ? "예약 확정"
                  : action === "cancel"
                    ? "예약 취소"
                    : "버리고 닫기"}
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
