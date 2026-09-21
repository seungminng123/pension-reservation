export type RoomListItem = {
  roomId: number;
  type: string;
  name: string;
  price: number;
  maxGuests: number;
  guestCount: number;
  imageUrl: string | null;
};

export type RoomDetail = {
  roomId: number;
  type: string;
  name: string;
  description: string | null;
  price: number;
  maxGuests: number;
  guestCount: number;
  imageUrl: string | null;
};

export type RoomAvailability = {
  roomId: number;
  year: number;
  month: number;
  unavailableDates: string[];
};

export type RoomAvailabilityCheck = {
  available: boolean;
};
