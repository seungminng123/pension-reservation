package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class AdminReservationListResponse {

    private final Long reservationId;
    private final String reservationNumber;
    private final String guestName;
    private final String roomName;
    private final Integer quantity;
    private final LocalDate checkIn;
    private final LocalDate checkOut;
    private final ReservationStatus status;

    public AdminReservationListResponse(
            Reservation reservation
    ) {
        this.reservationId =
                reservation.getReservationId();

        this.reservationNumber =
                reservation.getReservationNumber();

        this.guestName =
                reservation.getGuestName();

        this.roomName =
                reservation.getRoom().getName();

        this.quantity =
                reservation.getQuantity();

        this.checkIn =
                reservation.getCheckIn();

        this.checkOut =
                reservation.getCheckOut();

        this.status =
                reservation.getStatus();
    }
}