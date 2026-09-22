import api from "@/api/axios";

import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminReservationDetail,
  AdminReservationListItem,
  AdminRoom,
  AdminRoomCreateRequest,
  AdminRoomMonthlyPrice,
  AdminRoomPriceResetRequest,
  AdminRoomPriceSetRequest,
  AdminRoomUpdateRequest,
} from "@/types/admin";
import type {
  ReservationStatus,
  ReservationStatusResponse,
} from "@/types/reservation";
import type { RoomDetail } from "@/types/room";

// 관리자 로그인
export const adminLogin = async (request: AdminLoginRequest) => {
  const response = await api.post<AdminLoginResponse>(
    "/api/v1/admin/login",
    request,
  );

  const accessToken = response.data.accessToken ?? response.data.token;

  if (!accessToken) {
    throw new Error("로그인 응답에 JWT가 없습니다.");
  }

  return accessToken;
};

// 예약 목록 조회
export const getAdminReservations = async (status?: ReservationStatus) => {
  const response = await api.get<AdminReservationListItem[]>(
    "/api/v1/admin/reservations",
    {
      params: status ? { status } : undefined,
    },
  );

  return response.data;
};

// 예약 상세 조회
export const getAdminReservation = async (reservationId: number) => {
  const response = await api.get<AdminReservationDetail>(
    `/api/v1/admin/reservations/${reservationId}`,
  );

  return response.data;
};

// 예약 확정
export const confirmAdminReservation = async (reservationId: number) => {
  const response = await api.patch<ReservationStatusResponse>(
    `/api/v1/admin/reservations/${reservationId}/confirm`,
  );

  return response.data;
};

// 예약 취소
export const cancelAdminReservation = async (reservationId: number) => {
  const response = await api.patch<ReservationStatusResponse>(
    `/api/v1/admin/reservations/${reservationId}/cancel`,
  );

  return response.data;
};

// 객실 목록 조회
export const getAdminRooms = async () => {
  const response = await api.get<AdminRoom[]>("/api/v1/admin/rooms");

  return response.data;
};

// 객실 등록
export const createAdminRoom = async (request: AdminRoomCreateRequest) => {
  const response = await api.post<RoomDetail>("/api/v1/admin/rooms", request);

  return response.data;
};

// 객실 수정
export const updateAdminRoom = async (
  roomId: number,
  request: AdminRoomUpdateRequest,
) => {
  const response = await api.patch<RoomDetail>(
    `/api/v1/admin/rooms/${roomId}`,
    request,
  );

  return response.data;
};

// 객실 이미지 등록
export const uploadAdminRoomImage = async (roomId: number, file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  await api.post(`/api/v1/admin/rooms/${roomId}/image`, formData);
};

// 월별 요금 조회
export const getAdminRoomPrices = async (
  roomId: number,
  year: number,
  month: number,
) => {
  const response = await api.get<AdminRoomMonthlyPrice>(
    `/api/v1/admin/rooms/${roomId}/prices`,
    {
      params: {
        year,
        month,
      },
    },
  );

  return response.data;
};

// 날짜별 요금 설정
export const setAdminRoomPrices = async (
  roomId: number,
  request: AdminRoomPriceSetRequest,
) => {
  const response = await api.put<AdminRoomMonthlyPrice>(
    `/api/v1/admin/rooms/${roomId}/prices`,
    request,
  );

  return response.data;
};

// 날짜별 요금 초기화
export const resetAdminRoomPrices = async (
  roomId: number,
  request: AdminRoomPriceResetRequest,
) => {
  await api.delete(`/api/v1/admin/rooms/${roomId}/prices`, {
    data: request,
  });
};
