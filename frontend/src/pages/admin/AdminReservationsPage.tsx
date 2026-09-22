import {
  Banknote,
  CalendarDays,
  Check,
  CreditCard,
  List,
  X,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelAdminReservation,
  confirmAdminReservation,
  getAdminReservation,
  getAdminReservations,
} from "@/api/admin";

import AdminReservationCalendar from "@/components/admin/AdminReservationCalendar";
import Modal from "@/components/common/Modal";

import type { PaymentMethod, ReservationStatus } from "@/types/reservation";

type AdminReservationTab = "CALENDAR" | "LIST";

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "입금 확인 대기",
  CONFIRMED: "예약 확정",
  CANCEL_REQUESTED: "취소 요청",
  CANCELED: "취소 완료",
};

export default function AdminReservationsPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminReservationTab>("CALENDAR");

  const [status, setStatus] = useState<ReservationStatus | "ALL">("ALL");

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );

  const [selectingPayment, setSelectingPayment] = useState(false);

  const {
    data: reservations,
    isLoading,
    isError: listError,
  } = useQuery({
    queryKey: ["adminReservations", status],
    queryFn: () => getAdminReservations(status === "ALL" ? undefined : status),
    enabled: activeTab === "LIST",
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
      ].map((key) =>
        queryClient.invalidateQueries({
          queryKey: [key],
        }),
      ),
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

      setSelectingPayment(false);
      setPaymentMethod(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAdminReservation,

    onSuccess: refreshReservations,
  });

  const closeDetail = () => {
    if (confirmMutation.isPending || cancelMutation.isPending) {
      return;
    }

    setSelectedId(null);
    setSelectingPayment(false);
    setPaymentMethod(null);
  };

  const formatSchedule = (
    roomType: "ROOM" | "PYEONGSANG",
    checkIn: string,
    checkOut: string,
  ) => {
    if (roomType === "PYEONGSANG") {
      return `${checkIn} · 하루 이용`;
    }

    return `${checkIn} ~ ${checkOut}`;
  };

  return (
    <div>
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold">예약 관리</h2>

        <p className="mt-2 text-sm text-gray-500">
          예약 현황을 확인하고 예약을 확정하거나 취소할 수 있습니다.
        </p>
      </div>

      {/* 탭 */}
      <div className="mt-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("CALENDAR")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "CALENDAR"
              ? "bg-white text-black shadow-sm"
              : "text-gray-500"
          }`}
        >
          <CalendarDays size={18} />
          예약 캘린더
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LIST")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "LIST"
              ? "bg-white text-black shadow-sm"
              : "text-gray-500"
          }`}
        >
          <List size={18} />
          전체 예약
        </button>
      </div>

      {/* 예약 캘린더 */}
      {activeTab === "CALENDAR" && (
        <div className="mt-6">
          <AdminReservationCalendar onSelect={setSelectedId} />
        </div>
      )}

      {/* 전체 예약 */}
      {activeTab === "LIST" && (
        <section className="mt-6">
          <div className="mb-4 flex justify-end">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ReservationStatus | "ALL")
              }
              className="min-h-11 w-full rounded-lg border bg-white px-4 py-2 sm:w-auto"
            >
              <option value="ALL">전체 예약</option>

              <option value="PENDING">입금 확인 대기</option>

              <option value="CONFIRMED">예약 확정</option>

              <option value="CANCEL_REQUESTED">취소 요청</option>

              <option value="CANCELED">취소 완료</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white">
            {isLoading ? (
              <p className="p-6 text-sm text-gray-500">
                예약 목록을 불러오는 중입니다.
              </p>
            ) : listError ? (
              <p role="alert" className="p-6 text-sm text-red-500">
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
                  className="flex w-full min-w-0 flex-col items-start justify-between gap-3 border-b p-4 text-left transition last:border-b-0 hover:bg-gray-50 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{reservation.guestName}</p>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                        {reservation.roomType === "ROOM" ? "방" : "평상"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {reservation.roomName} · {reservation.quantity}개
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatSchedule(
                        reservation.roomType,
                        reservation.checkIn,
                        reservation.checkOut,
                      )}
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
        </section>
      )}

      {/* 예약 상세 로딩 */}
      {selectedId !== null && detailLoading && (
        <p className="mt-6 text-sm text-gray-500">
          예약 상세를 불러오는 중입니다.
        </p>
      )}

      {selectedId !== null && detailError && (
        <p role="alert" className="mt-6 text-sm text-red-500">
          예약 상세를 불러오지 못했습니다.
        </p>
      )}

      {/* 예약 상세 모달 */}
      {selectedReservation && (
        <Modal
          title="예약 상세"
          busy={confirmMutation.isPending || cancelMutation.isPending}
          onClose={closeDetail}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">예약번호</p>

              <p className="mt-1 break-all font-medium">
                {selectedReservation.reservationNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">상태</p>

              <p className="mt-1 font-medium">
                {statusLabels[selectedReservation.status]}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">예약자</p>

              <p className="mt-1 font-medium">
                {selectedReservation.guestName}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">전화번호</p>

              <p className="mt-1 font-medium">
                {selectedReservation.phoneNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">입금자명</p>

              <p className="mt-1 font-medium">
                {selectedReservation.depositorName}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">인원</p>

              <p className="mt-1 font-medium">
                {selectedReservation.guestCount}명
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">상품</p>

              <p className="mt-1 font-medium">
                {selectedReservation.roomName} · {selectedReservation.quantity}
                개
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">예약 일정</p>

              <p className="mt-1 font-medium">
                {formatSchedule(
                  selectedReservation.roomType,
                  selectedReservation.checkIn,
                  selectedReservation.checkOut,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">총 금액</p>

              <p className="mt-1 font-medium">
                {selectedReservation.totalPrice.toLocaleString()}원
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">예약금</p>

              <p className="mt-1 font-medium">
                {selectedReservation.depositAmount.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 확정된 예약 */}
          {selectedReservation.status === "CONFIRMED" && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm">
              <p>
                결제수단:{" "}
                <strong>
                  {selectedReservation.paymentMethod === "CARD"
                    ? "카드"
                    : selectedReservation.paymentMethod === "CASH"
                      ? "현금"
                      : "미등록"}
                </strong>
              </p>

              {selectedReservation.confirmedAt && (
                <p className="mt-2">
                  확정 시간:{" "}
                  <strong>
                    {new Date(selectedReservation.confirmedAt).toLocaleString(
                      "ko-KR",
                    )}
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* 결제수단 선택 */}
          {selectedReservation.status === "PENDING" && selectingPayment && (
            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <p className="font-semibold">결제 수단을 선택해 주세요.</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border ${
                    paymentMethod === "CARD"
                      ? "border-black bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  <CreditCard size={20} />
                  카드
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border ${
                    paymentMethod === "CASH"
                      ? "border-black bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  <Banknote size={20} />
                  현금
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectingPayment(false);
                    setPaymentMethod(null);
                  }}
                  className="min-h-11 rounded-xl border bg-white"
                >
                  취소
                </button>

                <button
                  type="button"
                  disabled={!paymentMethod || confirmMutation.isPending}
                  onClick={() => {
                    if (!paymentMethod) {
                      return;
                    }

                    confirmMutation.mutate({
                      reservationId: selectedReservation.reservationId,
                      paymentMethod,
                    });
                  }}
                  className="min-h-11 rounded-xl bg-black text-white disabled:bg-gray-300"
                >
                  {confirmMutation.isPending ? "확정 중..." : "예약 확정"}
                </button>
              </div>
            </div>
          )}

          {confirmMutation.isError && (
            <p role="alert" className="mt-4 text-sm text-red-500">
              예약 확정에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}

          {cancelMutation.isError && (
            <p role="alert" className="mt-4 text-sm text-red-500">
              예약 취소에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}

          {/* 하단 버튼 */}
          {!selectingPayment && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {selectedReservation.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => {
                    confirmMutation.reset();
                    setPaymentMethod(null);
                    setSelectingPayment(true);
                  }}
                  disabled={cancelMutation.isPending}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 text-white"
                >
                  <Check size={20} />
                  입금 확인 · 예약 확정
                </button>
              )}

              {selectedReservation.status !== "CANCELED" && (
                <button
                  type="button"
                  onClick={() =>
                    cancelMutation.mutate(selectedReservation.reservationId)
                  }
                  disabled={
                    confirmMutation.isPending || cancelMutation.isPending
                  }
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500 px-4 text-red-500"
                >
                  <X size={20} />
                  {cancelMutation.isPending ? "취소 중..." : "예약 취소"}
                </button>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
