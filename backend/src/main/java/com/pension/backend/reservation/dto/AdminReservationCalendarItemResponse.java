package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class AdminReservationCalendarItemResponse {

    private final Long reservationId;

    private final String reservationNumber;

    private final Long roomId;

    private final String roomType;

    private final String roomName;

    private final String guestName;

    private final Integer quantity;

    private final LocalDate checkIn;

    private final LocalDate checkOut;

    private final ReservationStatus status;

    public AdminReservationCalendarItemResponse(
            Reservation reservation
    ) {
        this.reservationId =
                reservation.getReservationId();

        this.reservationNumber =
                reservation.getReservationNumber();

        this.roomId =
                reservation.getRoom().getRoomId();

        this.roomType =
                reservation.getRoom().getType();

        this.roomName =
                reservation.getRoom().getName();

        this.guestName =
                reservation.getGuestName();

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