export type ReservationStatus =
  "PENDING" | "CONFIRMED" | "CANCEL_REQUESTED" | "CANCELED";

export type ReservationCreateRequest = {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  quantity: number;
  guestName: string;
  phoneNumber: string;
  depositorName: string;
};

export type ReservationLookupRequest = {
  reservationNumber: string;
  phoneNumber: string;
};

export type ReservationResponse = {
  reservationNumber: string;
  roomId: number;
  roomName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  quantity: number;
  totalPrice: number;
  depositAmount: number;
  status: ReservationStatus;
};

export type ReservationStatusResponse = {
  reservationNumber: string;
  status: ReservationStatus;
};
