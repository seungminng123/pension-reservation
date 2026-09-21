import api from "@/api/axios";

import type {
  RoomAvailability,
  RoomAvailabilityCheck,
  RoomDetail,
  RoomListItem,
} from "@/types/room";

export const getRooms = async () => {
  const response = await api.get<RoomListItem[]>("/api/v1/rooms");

  return response.data;
};

export const getRoom = async (roomId: number) => {
  const response = await api.get<RoomDetail>(`/api/v1/rooms/${roomId}`);

  return response.data;
};

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
