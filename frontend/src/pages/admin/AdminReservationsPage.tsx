import { Banknote, CreditCard, Check, X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelAdminReservation,
  confirmAdminReservation,
  getAdminReservation,
  getAdminReservations,
} from "@/api/admin";

import Modal from "@/components/common/Modal";
import AdminReservationCalendar from "@/components/admin/AdminReservationCalendar";
import type { PaymentMethod, ReservationStatus } from "@/types/reservation";

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "입금 확인 대기",
  CONFIRMED: "예약 확정",
  CANCEL_REQUESTED: "취소 요청",
  CANCELED: "취소 완료",
};

export default function AdminReservationsPage() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<ReservationStatus | "ALL">("ALL");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );

  const {
    data: reservations,
    isLoading,
    isError: listError,
  } = useQuery({
    queryKey: ["adminReservations", status],

    queryFn: () => getAdminReservations(status === "ALL" ? undefined : status),
  });

  const {
    data: selectedReservation,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ["adminReservation", selectedId],

    queryFn: () => getAdminReservation(selectedId!),

    enabled: selectedId !== null,
  });

  const refreshReservations = async () => {
    await Promise.all(
      [
        "adminReservations",
        "adminReservation",
        "adminReservationCalendar",
        "adminReservationsByDate",
        "adminSettlements",
        "availableRooms",
        "roomAvailabilityCheck",
      ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    );
  };
  const confirmMutation = useMutation({
    mutationFn: ({
      reservationId,
      paymentMethod,
    }: {
      reservationId: number;
      paymentMethod: PaymentMethod;
    }) => confirmAdminReservation(reservationId, paymentMethod),
    onSuccess: async () => {
      await refreshReservations();
      setPaymentTarget(null);
      setPaymentMethod(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAdminReservation,

    onSuccess: refreshReservations,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">예약 관리</h2>

          <p className="mt-2 text-sm text-gray-500">
            입금 확인 후 예약을 확정하거나 취소할 수 있습니다.
          </p>
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as ReservationStatus | "ALL")
          }
          className="min-h-11 w-full min-w-0 rounded-lg border bg-white px-4 py-2 sm:w-auto sm:shrink-0"
        >
          <option value="ALL">전체 예약</option>

          <option value="PENDING">입금 확인 대기</option>

          <option value="CONFIRMED">예약 확정</option>

          <option value="CANCEL_REQUESTED">취소 요청</option>

          <option value="CANCELED">취소 완료</option>
        </select>
      </div>

      <AdminReservationCalendar onSelect={setSelectedId} />

      <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
        {isLoading ? (
          <p className="p-6">예약 목록을 불러오는 중입니다.</p>
        ) : listError ? (
          <p role="alert" className="p-6 text-red-500">
            예약 정보를 불러오지 못했습니다.
          </p>
        ) : !reservations?.length ? (
          <div className="p-12 text-center text-gray-500">
            예약 내역이 없습니다.
          </div>
        ) : (
          reservations.map((reservation) => (
            <button
              key={reservation.reservationId}
              type="button"
              onClick={() => setSelectedId(reservation.reservationId)}
              className="flex w-full min-w-0 flex-col items-start justify-between gap-3 border-b p-4 sm:flex-row sm:items-center sm:p-5 text-left last:border-b-0 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold">{reservation.guestName}</p>

                <p className="mt-1 text-sm text-gray-500">
                  {reservation.roomName}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {reservation.roomName} · {reservation.quantity}개
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {reservation.checkIn} ~ {reservation.checkOut}
                </p>
              </div>

              <div className="min-w-0 text-left sm:text-right">
                <p className="text-sm font-medium">
                  {statusLabels[reservation.status]}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {reservation.reservationNumber}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {detailLoading && <p className="mt-6">예약 상세를 불러오는 중입니다.</p>}
      {detailError && (
        <p role="alert" className="mt-6 text-red-500">
          예약 정보를 불러오지 못했습니다.
        </p>
      )}
      {selectedReservation && (
        <section className="mt-8 rounded-2xl border bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">예약 상세</h3>

            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-500"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" /> 닫기
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <p>
              <span className="text-gray-500">예약번호</span>
              <br />
              {selectedReservation.reservationNumber}
            </p>

            <p>
              <span className="text-gray-500">상태</span>
              <br />
              {statusLabels[selectedReservation.status]}
            </p>

            <p>
              <span className="text-gray-500">예약자</span>
              <br />
              {selectedReservation.guestName}
            </p>

            <p>
              <span className="text-gray-500">전화번호</span>
              <br />
              {selectedReservation.phoneNumber}
            </p>

            <p>
              <span className="text-gray-500">입금자명</span>
              <br />
              {selectedReservation.depositorName}
            </p>

            <p>
              <span className="text-gray-500">인원</span>
              <br />
              {selectedReservation.guestCount}명
            </p>
            <p>
              <span className="text-gray-500">예약 수량</span>
              <br />
              {selectedReservation.quantity}개
            </p>

            <p>
              <span className="text-gray-500">객실</span>
              <br />
              {selectedReservation.roomName}
            </p>

            <p>
              <span className="text-gray-500">예약 일정</span>
              <br />
              {selectedReservation.checkIn} ~ {selectedReservation.checkOut}
            </p>

            <p>
              <span className="text-gray-500">총 금액</span>
              <br />
              {selectedReservation.totalPrice.toLocaleString()}원
            </p>

            <p>
              <span className="text-gray-500">예약금</span>
              <br />
              {selectedReservation.depositAmount.toLocaleString()}원
            </p>
          </div>

          {selectedReservation.status === "CONFIRMED" && (
            <div className="mt-5 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
              <p>
                결제수단:{" "}
                {selectedReservation.paymentMethod === "CARD"
                  ? "카드"
                  : selectedReservation.paymentMethod === "CASH"
                    ? "현금"
                    : "미등록"}
              </p>
              {selectedReservation.confirmedAt && (
                <p>
                  확정 시간:{" "}
                  {new Date(selectedReservation.confirmedAt).toLocaleString(
                    "ko-KR",
                  )}
                </p>
              )}
            </div>
          )}
          {cancelMutation.isError && (
            <p role="alert" className="mt-4 text-red-500">
              예약 취소에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {selectedReservation.status === "PENDING" && (
              <button
                type="button"
                onClick={() => {
                  confirmMutation.reset();
                  setPaymentMethod(null);
                  setPaymentTarget(selectedReservation.reservationId);
                }}
                disabled={confirmMutation.isPending || cancelMutation.isPending}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-white"
              >
                <Check size={20} strokeWidth={2} aria-hidden="true" /> 입금 확인
                · 예약 확정
              </button>
            )}

            {selectedReservation.status !== "CANCELED" && (
              <button
                type="button"
                onClick={() =>
                  cancelMutation.mutate(selectedReservation.reservationId)
                }
                disabled={confirmMutation.isPending || cancelMutation.isPending}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500 py-3 text-red-500"
              >
                <X size={20} strokeWidth={2} aria-hidden="true" /> 예약 취소
              </button>
            )}
          </div>
        </section>
      )}
      {paymentTarget !== null && (
        <Modal
          title="예약 확정"
          busy={confirmMutation.isPending}
          onClose={() => setPaymentTarget(null)}
        >
          <p className="text-gray-500">결제 수단을 선택해 주세요.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {(["CARD", "CASH"] as const).map((method) => (
              <button
                key={method}
                type="button"
                disabled={confirmMutation.isPending}
                aria-pressed={paymentMethod === method}
                onClick={() => setPaymentMethod(method)}
                className={
                  "flex min-h-16 items-center justify-center gap-2 rounded-xl border " +
                  (paymentMethod === method
                    ? "bg-black text-white"
                    : "bg-white")
                }
              >
                {method === "CARD" ? (
                  <CreditCard size={20} />
                ) : (
                  <Banknote size={20} />
                )}
                {method === "CARD" ? "카드" : "현금"}
              </button>
            ))}
          </div>
          {confirmMutation.isError && (
            <p role="alert" className="mt-4 text-red-500">
              예약 확정에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={confirmMutation.isPending}
              onClick={() => setPaymentTarget(null)}
              className="min-h-11 rounded-xl border p-3"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!paymentMethod || confirmMutation.isPending}
              onClick={() => {
                if (paymentMethod)
                  confirmMutation.mutate({
                    reservationId: paymentTarget,
                    paymentMethod,
                  });
              }}
              className="min-h-11 rounded-xl bg-black p-3 text-white disabled:bg-gray-300"
            >
              {confirmMutation.isPending ? "확정 중..." : "예약 확정"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
