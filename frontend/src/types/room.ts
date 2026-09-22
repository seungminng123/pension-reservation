export type RoomType = "ROOM" | "PYEONGSANG";

export type AvailableRoom = {
  roomId: number;
  type: RoomType;
  name: string;
  price: number;
  guestCount: number;
  maxGuests: number;
  stockCount: number;
  remainingCount: number;
  available: boolean;
  totalPrice: number;
  hasImage: boolean;
};

export type RoomListItem = {
  roomId: number;
  type: RoomType;
  name: string;
  price: number;
  maxGuests: number;
  guestCount: number;
  stockCount: number;
  saleEnabled: boolean;
  hasImage: boolean;
};

export type RoomDetail = {
  roomId: number;
  type: RoomType;
  name: string;
  description: string | null;
  price: number;
  maxGuests: number;
  guestCount: number;
  stockCount: number;
  saleEnabled: boolean;
  hasImage: boolean;
};

export type RoomDailyPrice = {
  date: string;
  price: number;
  customPrice: boolean;
};

export type RoomDailyStock = {
  date: string;
  remainingCount: number;
  soldOut: boolean;
};

export type RoomAvailability = {
  roomId: number;
  year: number;
  month: number;
  unavailableDates: string[];
  dailyPrices: RoomDailyPrice[];
  dailyStocks: RoomDailyStock[];
};

export type RoomAvailabilityCheck = {
  available: boolean;
  totalPrice: number | null;
  remainingCount: number;
};

export type RoomImageMeta = {
  imageId: number;
  displayOrder: number;
};
