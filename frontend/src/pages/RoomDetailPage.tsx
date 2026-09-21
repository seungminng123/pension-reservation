import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { checkRoomAvailability, getRoom } from "@/api/room";
import { createReservation } from "@/api/reservation";

export default function RoomDetailPage() {
  const { roomId } = useParams();

  const id = Number(roomId);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);

  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [depositorName, setDepositorName] = useState("");

  const [available, setAvailable] = useState<boolean | null>(null);

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", id],
    queryFn: () => getRoom(id),
    enabled: Number.isFinite(id),
  });

  const availabilityMutation = useMutation({
    mutationFn: () => checkRoomAvailability(id, checkIn, checkOut),

    onSuccess: (data) => {
      setAvailable(data.available);
    },
  });

  const reservationMutation = useMutation({
    mutationFn: createReservation,
  });

  const handleAvailabilityCheck = () => {
    if (!checkIn || !checkOut) {
      alert("체크인과 체크아웃 날짜를 선택해 주세요.");
      return;
    }

    availabilityMutation.mutate();
  };

  const handleReservation = () => {
    if (!room) {
      return;
    }

    if (!checkIn || !checkOut) {
      alert("예약 날짜를 선택해 주세요.");
      return;
    }

    if (available !== true) {
      alert("먼저 예약 가능 여부를 확인해 주세요.");
      return;
    }

    if (!guestName || !phoneNumber || !depositorName) {
      alert("예약자 정보를 모두 입력해 주세요.");
      return;
    }

    reservationMutation.mutate({
      roomId: room.roomId,
      checkIn,
      checkOut,
      guestCount,
      guestName,
      phoneNumber,
      depositorName,
    });
  };

  if (isLoading || !room) {
    return <main className="p-6">객실 정보를 불러오는 중입니다.</main>;
  }

  const reservation = reservationMutation.data;

  if (reservation) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <div className="rounded-2xl border p-8">
          <h1 className="text-2xl font-bold">예약 신청이 완료되었습니다.</h1>

          <p className="mt-2 text-gray-500">
            예약금을 입금하면 관리자가 확인 후 예약을 확정합니다.
          </p>

          <div className="mt-8 space-y-3">
            <p>
              예약번호: <strong>{reservation.reservationNumber}</strong>
            </p>

            <p>객실: {reservation.roomName}</p>

            <p>
              일정: {reservation.checkIn} ~ {reservation.checkOut}
            </p>

            <p>총 금액: {reservation.totalPrice.toLocaleString()}원</p>

            <p>예약금: {reservation.depositAmount.toLocaleString()}원</p>

            <p>상태: {reservation.status}</p>
          </div>

          <Link
            to="/reservation/lookup"
            className="mt-8 block rounded-xl bg-black px-5 py-3 text-center text-white"
          >
            예약 조회하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/" className="text-sm text-gray-500">
        ← 객실 목록
      </Link>

      {room.imageUrl && (
        <img
          src={room.imageUrl}
          alt={room.name}
          className="mt-6 h-96 w-full rounded-2xl object-cover"
        />
      )}

      <section className="mt-8">
        <p className="text-sm text-gray-500">{room.type}</p>

        <h1 className="mt-1 text-3xl font-bold">{room.name}</h1>

        <p className="mt-4 text-gray-600">
          {room.description ?? "객실 설명이 없습니다."}
        </p>

        <p className="mt-5 text-xl font-bold">
          {room.price.toLocaleString()}원 / 박
        </p>

        <p className="mt-2 text-sm text-gray-500">
          기준 {room.guestCount}명 · 최대 {room.maxGuests}명
        </p>
      </section>

      <section className="mt-10 rounded-2xl border p-6">
        <h2 className="text-xl font-bold">예약 날짜 선택</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm">체크인</span>

            <input
              type="date"
              value={checkIn}
              onChange={(event) => {
                setCheckIn(event.target.value);
                setAvailable(null);
              }}
              className="w-full rounded-lg border p-3"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm">체크아웃</span>

            <input
              type="date"
              value={checkOut}
              onChange={(event) => {
                setCheckOut(event.target.value);
                setAvailable(null);
              }}
              className="w-full rounded-lg border p-3"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleAvailabilityCheck}
          className="mt-5 w-full rounded-xl bg-gray-900 px-5 py-3 text-white"
        >
          예약 가능 여부 확인
        </button>

        {available === true && (
          <p className="mt-4 text-center font-medium text-green-600">
            예약 가능한 날짜입니다.
          </p>
        )}

        {available === false && (
          <p className="mt-4 text-center font-medium text-red-500">
            이미 예약된 날짜가 포함되어 있습니다.
          </p>
        )}
      </section>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-bold">예약자 정보</h2>

        <div className="mt-5 space-y-4">
          <input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            placeholder="예약자 이름"
            className="w-full rounded-lg border p-3"
          />

          <input
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="전화번호 (01012345678)"
            className="w-full rounded-lg border p-3"
          />

          <input
            value={depositorName}
            onChange={(event) => setDepositorName(event.target.value)}
            placeholder="입금자명"
            className="w-full rounded-lg border p-3"
          />

          <label>
            <span className="mb-2 block text-sm">인원</span>

            <input
              type="number"
              min={1}
              max={room.maxGuests}
              value={guestCount}
              onChange={(event) => setGuestCount(Number(event.target.value))}
              className="w-full rounded-lg border p-3"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleReservation}
          disabled={reservationMutation.isPending}
          className="mt-6 w-full rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {reservationMutation.isPending ? "예약 신청 중..." : "예약 신청"}
        </button>

        {reservationMutation.isError && (
          <p className="mt-4 text-center text-red-500">
            예약 신청에 실패했습니다.
          </p>
        )}
      </section>
    </main>
  );
}
