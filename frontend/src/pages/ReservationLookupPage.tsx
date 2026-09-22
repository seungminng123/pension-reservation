import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { lookupReservation, requestReservationCancel } from "@/api/reservation";

export default function ReservationLookupPage() {
  const [reservationNumber, setReservationNumber] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const lookupMutation = useMutation({
    mutationFn: lookupReservation,
  });

  const cancelMutation = useMutation({
    mutationFn: () => requestReservationCancel(reservationNumber, phoneNumber),

    onSuccess: () => {
      lookupMutation.mutate({
        reservationNumber,
        phoneNumber,
      });
    },
  });

  const handleLookup = () => {
    if (!reservationNumber || !phoneNumber) {
      alert("예약번호와 전화번호를 입력해 주세요.");
      return;
    }

    lookupMutation.mutate({
      reservationNumber,
      phoneNumber,
    });
  };

  const reservation = lookupMutation.data;

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-5 sm:py-12">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-500"
      >
        <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" /> 홈
      </Link>

      <h1 className="mt-6 text-3xl font-bold">예약 조회</h1>

      <p className="mt-2 text-gray-500">
        예약번호와 예약 시 입력한 전화번호를 입력해 주세요.
      </p>

      <div className="mt-8 space-y-4">
        <input
          value={reservationNumber}
          onChange={(event) => setReservationNumber(event.target.value)}
          placeholder="예약번호"
          className="min-w-0 w-full rounded-lg border p-3"
        />

        <input
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="전화번호"
          className="min-w-0 w-full rounded-lg border p-3"
        />

        <button
          type="button"
          onClick={handleLookup}
          className="w-full rounded-xl bg-black p-3 text-white"
        >
          예약 조회
        </button>
      </div>

      {lookupMutation.isError && (
        <p className="mt-5 text-center text-red-500">
          예약 정보를 찾을 수 없습니다.
        </p>
      )}

      {reservation && (
        <section className="mt-8 rounded-2xl border p-4 sm:p-6">
          <h2 className="text-xl font-bold">예약 정보</h2>

          <div className="mt-5 space-y-3">
            <p>예약번호: {reservation.reservationNumber}</p>

            <p>객실: {reservation.roomName}</p>

            <p>예약자: {reservation.guestName}</p>

            <p>
              일정: {reservation.checkIn} ~ {reservation.checkOut}
            </p>

            <p>인원: {reservation.guestCount}명</p>

            <p>결제 예정 금액: {reservation.totalPrice.toLocaleString()}원</p>

            <p>예약금: {reservation.depositAmount.toLocaleString()}원</p>

            <p>상태: {reservation.status}</p>
          </div>

          {(reservation.status === "PENDING" ||
            reservation.status === "CONFIRMED") && (
            <button
              type="button"
              onClick={() => cancelMutation.mutate()}
              className="mt-6 w-full rounded-xl border border-red-500 p-3 text-red-500"
            >
              예약 취소 요청
            </button>
          )}

          {reservation.status === "CANCEL_REQUESTED" && (
            <p className="mt-5 text-center text-orange-500">
              취소 요청이 접수되었습니다.
            </p>
          )}

          {reservation.status === "CANCELED" && (
            <p className="mt-5 text-center text-gray-500">취소된 예약입니다.</p>
          )}
        </section>
      )}
    </main>
  );
}
