import { ArrowLeft, ArrowRight, Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { checkRoomAvailability, getRoom } from "@/api/room";
import { createReservation } from "@/api/reservation";

import RoomImageGallery from "@/components/room/RoomImageGallery";
import { formatDate, isValidDate } from "@/utils/date";

export default function RoomDetailPage() {
  const { roomId } = useParams();

  const id = Number(roomId);

  const [searchParams] = useSearchParams();
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const validDates =
    isValidDate(checkIn) &&
    isValidDate(checkOut) &&
    checkIn >= formatDate(new Date()) &&
    checkOut > checkIn;

  const [guestCount, setGuestCount] = useState(1);

  const [quantity, setQuantity] = useState(1);

  const [guestName, setGuestName] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [depositorName, setDepositorName] = useState("");

  const {
    data: room,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["room", id],
    queryFn: () => getRoom(id),
    enabled: Number.isFinite(id),
  });

  const availabilityQuery = useQuery({
    queryKey: ["roomAvailabilityCheck", id, checkIn, checkOut, quantity],
    queryFn: () => checkRoomAvailability(id, checkIn, checkOut, quantity),
    enabled: Number.isInteger(id) && id > 0 && validDates,
  });
  const available =
    !availabilityQuery.isFetching &&
    !availabilityQuery.isError &&
    availabilityQuery.data?.available === true &&
    availabilityQuery.data.totalPrice !== null;
  const reservationMutation = useMutation({ mutationFn: createReservation });
  if (!validDates)
    return (
      <main className="mx-auto max-w-xl space-y-5 px-4 py-12 text-center">
        <p>예약 날짜를 먼저 선택해 주세요.</p>
        <Link
          to="/"
          className="inline-block rounded-xl bg-black px-6 py-3 text-white"
        >
          날짜 선택하기
        </Link>
      </main>
    );

  if (isLoading) {
    return (
      <main className="p-10 text-center">객실 정보를 불러오는 중입니다.</main>
    );
  }

  if (isError || !room) {
    return (
      <main className="p-10 text-center">객실 정보를 불러오지 못했습니다.</main>
    );
  }

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const totalPrice =
    available === true ? (availabilityQuery.data?.totalPrice ?? 0) : 0;

  const remainingCount = availabilityQuery.data?.remainingCount;
  const maxQuantity = Math.min(room.stockCount, remainingCount ?? 0);

  const decreaseGuestCount = () => {
    setGuestCount((current) => Math.max(1, current - 1));
  };

  const increaseGuestCount = () => {
    setGuestCount((current) => Math.min(room.maxGuests, current + 1));
  };

  const changeQuantity = (nextQuantity: number) => {
    setQuantity(Math.max(1, Math.min(maxQuantity, nextQuantity)));
  };

  const handleReservation = () => {
    if (!checkIn || !checkOut) {
      alert("체크인과 체크아웃 날짜를 선택해 주세요.");

      return;
    }

    if (!available || quantity > maxQuantity || reservationMutation.isPending) {
      alert("예약 가능한 일정인지 확인해 주세요.");

      return;
    }

    if (!guestName.trim()) {
      alert("예약자 이름을 입력해 주세요.");
      return;
    }

    if (!phoneNumber.trim()) {
      alert("전화번호를 입력해 주세요.");
      return;
    }

    if (!depositorName.trim()) {
      alert("입금자명을 입력해 주세요.");
      return;
    }

    reservationMutation.mutate({
      roomId: room.roomId,
      checkIn,
      checkOut,
      guestCount,
      quantity,
      guestName,
      phoneNumber,
      depositorName,
    });
  };

  const reservation = reservationMutation.data;

  if (reservation) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-4 py-8 sm:px-5 sm:py-14">
        <div className="rounded-3xl border bg-white p-4 sm:p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
            <Check size={24} />
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            예약 신청이 완료되었습니다
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            예약금을 입금하면 관리자가 확인 후 예약을 확정합니다.
          </p>

          <div className="mt-8 rounded-2xl bg-gray-50 p-5">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-5">
                <span className="text-gray-500">예약번호</span>

                <strong>{reservation.reservationNumber}</strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-gray-500">객실</span>

                <strong>{reservation.roomName}</strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-gray-500">수량</span>

                <strong>{reservation.quantity}개</strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-gray-500">일정</span>

                <strong className="text-right">
                  {reservation.checkIn}
                  <br />~ {reservation.checkOut}
                </strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-gray-500">총 금액</span>

                <strong>{reservation.totalPrice.toLocaleString()}원</strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-gray-500">예약금</span>

                <strong>{reservation.depositAmount.toLocaleString()}원</strong>
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm font-medium text-red-500">
            예약번호는 예약 조회 시 필요하므로 꼭 보관해 주세요.
          </p>

          <Link
            to="/reservation/lookup"
            className="mt-7 block rounded-xl bg-black py-4 text-center font-bold text-white"
          >
            예약 조회하기
          </Link>

          <Link
            to="/"
            className="mt-3 block py-3 text-center text-sm text-gray-500"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-[calc(13rem+env(safe-area-inset-bottom))] sm:pb-28">
      <section className="mx-auto max-w-4xl">
        <div className="relative">
          <RoomImageGallery roomId={room.roomId} roomName={room.name} />

          <Link
            to="/"
            className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 sm:px-5">
        <section className="border-b py-8">
          <p className="text-sm text-gray-500">
            {room.type === "ROOM" ? "방" : "평상"}
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{room.name}</h1>

          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-gray-600">
            {room.description || "객실 설명이 없습니다."}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-2xl font-bold">
                {room.price.toLocaleString()}원
              </span>

              <span className="ml-1 text-sm text-gray-500">/ 기본 1박</span>
            </div>

            <p className="text-sm text-gray-500">
              기준 {room.guestCount}명 · 최대 {room.maxGuests}명
            </p>
          </div>

          {room.stockCount > 1 && (
            <p className="mt-2 text-sm text-gray-500">
              총 {room.stockCount}개 운영
            </p>
          )}

          <p className="mt-3 text-xs text-gray-400">
            날짜에 따라 실제 숙박 요금이 달라질 수 있습니다.
          </p>
        </section>

        <section className="border-b py-8">
          <h2 className="text-xl font-bold">선택 일정</h2>
          <p className="mt-2 text-sm text-gray-500">{nights}박</p>
          <Link to="/" className="mt-2 inline-block text-sm underline">
            날짜 변경하기
          </Link>

          {(checkIn || checkOut) && (
            <div className="mt-5 grid grid-cols-1 gap-2 rounded-2xl bg-gray-50 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div>
                <p className="text-xs text-gray-500">체크인</p>

                <p className="mt-1 font-bold">{checkIn || "날짜 선택"}</p>
              </div>

              <ArrowRight size={20} className="hidden text-gray-300 sm:block" />

              <div className="sm:text-right">
                <p className="text-xs text-gray-500">체크아웃</p>

                <p className="mt-1 font-bold">{checkOut || "날짜 선택"}</p>
              </div>
            </div>
          )}

          {availabilityQuery.isFetching && (
            <p className="mt-4 text-center text-sm text-gray-500">
              예약 가능 여부와 금액을 확인하고 있습니다.
            </p>
          )}

          {availabilityQuery.isError && (
            <p role="alert" className="mt-4 text-red-500">
              예약 가능 여부를 확인하지 못했습니다.{" "}
              <button
                type="button"
                onClick={() => void availabilityQuery.refetch()}
                className="underline"
              >
                다시 시도
              </button>
            </p>
          )}
          {availabilityQuery.data &&
            !availabilityQuery.isFetching &&
            !available && (
              <p role="status" className="mt-4 text-red-500">
                선택 기간 잔여 {remainingCount}개 · 현재 수량으로 예약할 수
                없습니다.
              </p>
            )}
          {available === true && (
            <div className="mt-4 rounded-xl bg-green-50 p-4 text-center">
              <p className="text-sm font-semibold text-green-600">
                예약 가능한 일정입니다.
              </p>

              {remainingCount !== undefined && (
                <p className="mt-1 text-sm text-gray-600">
                  선택 기간 잔여 {remainingCount}개
                </p>
              )}

              {nights > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  {nights}박 · {quantity}개 · {totalPrice.toLocaleString()}원
                </p>
              )}
            </div>
          )}
        </section>

        {room.stockCount > 1 && (
          <section className="border-b py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">수량</h2>

                <p className="mt-1 text-sm text-gray-500">
                  최대 {maxQuantity}개
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="수량 감소"
                  onClick={() => changeQuantity(quantity - 1)}
                  disabled={quantity <= 1 || availabilityQuery.isFetching}
                  className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
                >
                  <Minus size={20} />
                </button>

                <strong className="min-w-10 text-center">{quantity}개</strong>

                <button
                  type="button"
                  aria-label="수량 증가"
                  onClick={() => changeQuantity(quantity + 1)}
                  disabled={
                    availabilityQuery.isFetching || quantity >= maxQuantity
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="border-b py-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">인원</h2>

              <p className="mt-1 text-sm text-gray-500">
                최대 {room.maxGuests}명
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="인원 감소"
                onClick={decreaseGuestCount}
                disabled={guestCount <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
              >
                <Minus size={20} />
              </button>

              <strong className="min-w-10 text-center">{guestCount}명</strong>

              <button
                type="button"
                aria-label="인원 증가"
                onClick={increaseGuestCount}
                disabled={guestCount >= room.maxGuests}
                className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-xl font-bold">예약자 정보</h2>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                예약자 이름
              </span>

              <input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                className="w-full rounded-xl border px-4 py-4"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">전화번호</span>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="01012345678"
                className="w-full rounded-xl border px-4 py-4"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">입금자명</span>

              <input
                value={depositorName}
                onChange={(event) => setDepositorName(event.target.value)}
                className="w-full rounded-xl border px-4 py-4"
              />
            </label>
          </div>

          {reservationMutation.isError && (
            <p className="mt-5 text-center text-sm text-red-500">
              예약 신청에 실패했습니다. 예약 가능 여부를 다시 확인해 주세요.
            </p>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
          <div>
            {availabilityQuery.isFetching ? (
              <p className="text-sm text-gray-500">금액 확인 중...</p>
            ) : nights > 0 && available === true ? (
              <>
                <p className="text-xs text-gray-500">
                  {nights}박 · {quantity}개 총 금액
                </p>

                <p className="text-lg font-bold">
                  {totalPrice.toLocaleString()}원
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                예약 가능 여부를 확인해 주세요
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleReservation}
            disabled={
              !checkIn ||
              !checkOut ||
              available !== true ||
              quantity > maxQuantity ||
              availabilityQuery.isFetching ||
              reservationMutation.isPending
            }
            className="min-h-12 w-full rounded-xl bg-black px-6 py-3 font-bold text-white disabled:bg-gray-300 sm:w-auto sm:min-w-44"
          >
            {reservationMutation.isPending ? "예약 중..." : "예약하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
