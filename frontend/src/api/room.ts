import api from "@/api/axios";

import type {
  RoomAvailability,
  RoomAvailabilityCheck,
  RoomDetail,
  RoomListItem,
} from "@/types/room";

// 객실 목록 조회
export const getRooms = async () => {
  const response = await api.get<RoomListItem[]>("/api/v1/rooms");

  return response.data;
};

// 객실 상세 조회
export const getRoom = async (roomId: number) => {
  const response = await api.get<RoomDetail>(`/api/v1/rooms/${roomId}`);

  return response.data;
};

// 객실 예약 정보 조회
export const getRoomAvailability = async (
  roomId: number,
  year: number,
  month: number,
) => {
  const response = await api.get<RoomAvailability>(
    `/api/v1/rooms/${roomId}/availability`,
    {
      params: {
        year,
        month,
      },
    },
  );

  return response.data;
};

// 예약 가능 여부 확인
export const checkRoomAvailability = async (
  roomId: number,
  checkIn: string,
  checkOut: string,
) => {
  const response = await api.get<RoomAvailabilityCheck>(
    `/api/v1/rooms/${roomId}/availability/check`,
    {
      params: {
        checkIn,
        checkOut,
      },
    },
  );

  return response.data;
};

// 객실 이미지 주소
export const getRoomImageUrl = (roomId: number) => {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, "");

  return `${baseUrl}/api/v1/rooms/${roomId}/image`;
};
