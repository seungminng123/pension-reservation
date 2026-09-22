export type RoomListItem = {
  roomId: number;
  type: string;
  name: string;
  price: number;
  maxGuests: number;
  guestCount: number;
  hasImage: boolean;
};

export type RoomDetail = {
  roomId: number;
  type: string;
  name: string;
  description: string | null;
  price: number;
  maxGuests: number;
  guestCount: number;
  hasImage: boolean;
};

export type RoomDailyPrice = {
  date: string;
  price: number;
  customPrice: boolean;
};

export type RoomAvailability = {
  roomId: number;
  year: number;
  month: number;
  unavailableDates: string[];
  dailyPrices: RoomDailyPrice[];
};

export type RoomAvailabilityCheck = {
  available: boolean;
  totalPrice: number | null;
};
