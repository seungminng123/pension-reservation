import type { ReservationStatus } from "@/types/reservation";
import type { RoomListItem } from "@/types/room";

export type AdminLoginRequest = {
  loginId: string;
  password: string;
};

export type AdminLoginResponse = {
  accessToken?: string;
  token?: string;
};

export type AdminReservationListItem = {
  reservationId: number;
  reservationNumber: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
};

export type AdminReservationDetail = {
  reservationId: number;
  reservationNumber: string;
  guestName: string;
  phoneNumber: string;
  depositorName: string;
  roomId: number;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  depositAmount: number;
  status: ReservationStatus;
  createdAt: string;
};

export type AdminRoom = RoomListItem;

export type AdminRoomCreateRequest = {
  type: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  guestCount: number;
  imageUrl: string;
};
export type AdminRoomUpdateRequest = {
  type?: string;
  name?: string;
  description?: string;
  price?: number;
  maxGuests?: number;
  guestCount?: number;
  imageUrl?: string;
};
export type AdminRoomDailyPrice = {
  date: string;
  price: number;
  customPrice: boolean;
};

export type AdminRoomMonthlyPrice = {
  roomId: number;
  year: number;
  month: number;
  defaultPrice: number;
  prices: AdminRoomDailyPrice[];
};

export type AdminRoomPriceSetRequest = {
  dates: string[];
  price: number;
};

export type AdminRoomPriceResetRequest = {
  dates: string[];
};
