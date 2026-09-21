import api from "@/api/axios";

import type {
  ReservationCreateRequest,
  ReservationLookupRequest,
  ReservationResponse,
  ReservationStatusResponse,
} from "@/types/reservation";

export const createReservation = async (request: ReservationCreateRequest) => {
  const response = await api.post<ReservationResponse>(
    "/api/v1/reservations",
    request,
  );

  return response.data;
};

export const lookupReservation = async (request: ReservationLookupRequest) => {
  const response = await api.post<ReservationResponse>(
    "/api/v1/reservations/lookup",
    request,
  );

  return response.data;
};

export const requestReservationCancel = async (
  reservationNumber: string,
  phoneNumber: string,
) => {
  const response = await api.patch<ReservationStatusResponse>(
    `/api/v1/reservations/${reservationNumber}/cancel-request`,
    {
      phoneNumber,
    },
  );

  return response.data;
};
