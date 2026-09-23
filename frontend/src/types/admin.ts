import type { PaymentMethod, ReservationStatus } from "@/types/reservation";
import type { RoomListItem, RoomType } from "@/types/room";

export type AdminLoginRequest = {
  loginId: string;
  password: string;
};

export type AdminLoginResponse = {
  accessToken?: string;
  token?: string;
};

export type AdminReservationListItem = {
  phoneNumber: string;
  guestCount: number;
  depositorName: string;
  roomId: number;
  totalPrice: number;
  depositAmount: number;
  createdAt: string;
  roomType: RoomType;
  paymentMethod: PaymentMethod | null;
  confirmedAt: string | null;
  reservationId: number;
  reservationNumber: string;
  guestName: string;
  roomName: string;
  quantity: number;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
};

export type AdminReservationPageResponse = {
  items: AdminReservationListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type AdminReservationDetail = {
  roomType: RoomType;
  paymentMethod: PaymentMethod | null;
  confirmedAt: string | null;
  adminMemo: string | null;

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
  quantity: number;
  totalPrice: number;
  depositAmount: number;
  status: ReservationStatus;
  createdAt: string;
};

export type AdminRoom = RoomListItem;

export type AdminRoomCreateRequest = {
  type: RoomType;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  guestCount: number;
  stockCount: number;
  saleEnabled: boolean;
};

export type AdminRoomUpdateRequest = {
  type: RoomType;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  guestCount: number;
  stockCount: number;
  saleEnabled: boolean;
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

export type AdminReservationCalendarDay = {
  date: string;
  reservationCount: number;
  reservedQuantity: number;
  pendingCount: number;
  confirmedCount: number;
  cancelRequestedCount: number;
};
export type AdminReservationCalendarItem = {
  reservationId: number;
  reservationNumber: string;
  roomId: number;
  roomType: RoomType;
  roomName: string;
  guestName: string;
  quantity: number;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
};
export type SettlementItem = {
  reservationId: number;
  reservationNumber: string;
  roomType: RoomType;
  roomName: string;
  quantity: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  confirmedAt: string;
};
export type DailySettlement = {
  date: string;
  totalSales: number;
  cardSales: number;
  cashSales: number;
  confirmedReservationCount: number;
  totalQuantity: number;
  items: SettlementItem[];
};
export type MonthlySettlementDay = {
  date: string;
  totalSales: number;
  cardSales: number;
  cashSales: number;
  reservationCount: number;
  totalQuantity: number;
};
export type MonthlySettlement = {
  year: number;
  month: number;
  totalSales: number;
  cardSales: number;
  cashSales: number;
  confirmedReservationCount: number;
  totalQuantity: number;
  dailySettlements: MonthlySettlementDay[];
};
