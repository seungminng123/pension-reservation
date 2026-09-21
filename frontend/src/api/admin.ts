import api from "@/api/axios";

import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminReservationDetail,
  AdminReservationListItem,
  AdminRoom,
  AdminRoomCreateRequest,
} from "@/types/admin";
import type {
  ReservationStatus,
  ReservationStatusResponse,
} from "@/types/reservation";

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

export const getAdminReservations = async (status?: ReservationStatus) => {
  const response = await api.get<AdminReservationListItem[]>(
    "/api/v1/admin/reservations",
    {
      params: status ? { status } : undefined,
    },
  );

  return response.data;
};

export const getAdminReservation = async (reservationId: number) => {
  const response = await api.get<AdminReservationDetail>(
    `/api/v1/admin/reservations/${reservationId}`,
  );

  return response.data;
};

export const confirmAdminReservation = async (reservationId: number) => {
  const response = await api.patch<ReservationStatusResponse>(
    `/api/v1/admin/reservations/${reservationId}/confirm`,
  );

  return response.data;
};

export const cancelAdminReservation = async (reservationId: number) => {
  const response = await api.patch<ReservationStatusResponse>(
    `/api/v1/admin/reservations/${reservationId}/cancel`,
  );

  return response.data;
};

export const getAdminRooms = async () => {
  const response = await api.get<AdminRoom[]>("/api/v1/admin/rooms");

  return response.data;
};

export const createAdminRoom = async (request: AdminRoomCreateRequest) => {
  const response = await api.post<AdminRoom>("/api/v1/admin/rooms", request);

  return response.data;
};
