import api from "@/api/axios";

import type {
  AdminReservationCalendarDay,
  AdminReservationCalendarItem,
  DailySettlement,
  MonthlySettlement,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminReservationDetail,
  AdminReservationListItem,
  AdminReservationPageResponse,
  AdminRoom,
  AdminRoomCreateRequest,
  AdminRoomMonthlyPrice,
  AdminRoomPriceResetRequest,
  AdminRoomPriceSetRequest,
  AdminRoomUpdateRequest,
} from "@/types/admin";
import type {
  PaymentMethod,
  ReservationStatus,
  ReservationStatusResponse,
} from "@/types/reservation";
import type { RoomDetail, RoomImageMeta } from "@/types/room";

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
// 관리자 예약 메모 수정
export const updateAdminReservationMemo = async (
  reservationId: number,
  memo: string,
) => {
  const response = await api.patch<AdminReservationDetail>(
    `/api/v1/admin/reservations/${reservationId}/memo`,
    {
      memo,
    },
  );

  return response.data;
};
// 예약 확정
export const confirmAdminReservation = async (
  reservationId: number,
  paymentMethod: PaymentMethod,
) => {
  const response = await api.patch<ReservationStatusResponse>(
    `/api/v1/admin/reservations/${reservationId}/confirm`,
    { paymentMethod },
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

// 관리자 객실 목록 조회
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

// 객실 삭제
export const deleteAdminRoom = async (roomId: number) => {
  await api.delete(`/api/v1/admin/rooms/${roomId}`);
};

// 객실 이미지 여러 장 등록
export const uploadAdminRoomImages = async (roomId: number, files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post<RoomImageMeta[]>(
    `/api/v1/admin/rooms/${roomId}/images`,
    formData,
  );

  return response.data;
};

// 객실 이미지 삭제
export const deleteAdminRoomImage = async (roomId: number, imageId: number) => {
  await api.delete(`/api/v1/admin/rooms/${roomId}/images/${imageId}`);
};

// 객실 이미지 순서 변경
export const updateAdminRoomImageOrder = async (
  roomId: number,
  imageIds: number[],
) => {
  const response = await api.patch<RoomImageMeta[]>(
    `/api/v1/admin/rooms/${roomId}/images/order`,
    {
      imageIds,
    },
  );

  return response.data;
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

export const getAdminReservationCalendar = async (
  year: number,
  month: number,
) => {
  const response = await api.get<AdminReservationCalendarDay[]>(
    "/api/v1/admin/reservations/calendar",
    { params: { year, month } },
  );
  return response.data;
};
export const getAdminReservationsByDate = async (date: string) => {
  const response = await api.get<AdminReservationCalendarItem[]>(
    "/api/v1/admin/reservations/calendar/" + date,
  );
  return response.data;
};
export const getDailySettlement = async (date: string) => {
  const response = await api.get<DailySettlement>(
    "/api/v1/admin/settlements/daily",
    { params: { date } },
  );
  return response.data;
};
export const getMonthlySettlement = async (year: number, month: number) => {
  const response = await api.get<MonthlySettlement>(
    "/api/v1/admin/settlements/monthly",
    { params: { year, month } },
  );
  return response.data;
};

export type AdminReservationSearchParams = {
  q?: string;
  status?: ReservationStatus;
  date?: string;
  page?: number;
  size?: number;
};

export const searchAdminReservations = async (
  params: AdminReservationSearchParams,
) => {
  const response = await api.get<AdminReservationPageResponse>(
    "/api/v1/admin/reservations/search",
    {
      params: {
        ...params,
        q: params.q?.trim() || undefined,
        date: params.date || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    },
  );
  return response.data;
};
