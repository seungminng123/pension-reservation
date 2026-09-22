package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Schema(description = "사용자 예약 응답")
public class ReservationResponse {

    private final String reservationNumber;
    private final Long roomId;
    private final String roomName;
    private final String guestName;
    private final LocalDate checkIn;
    private final LocalDate checkOut;
    private final Integer guestCount;

    @Schema(
            description = "예약 수량",
            example = "2"
    )
    private final Integer quantity;

    private final Long totalPrice;
    private final Long depositAmount;
    private final ReservationStatus status;

    public ReservationResponse(
            Reservation reservation
    ) {
        this.reservationNumber =
                reservation.getReservationNumber();

        this.roomId =
                reservation.getRoom().getRoomId();

        this.roomName =
                reservation.getRoom().getName();

        this.guestName =
                reservation.getGuestName();

        this.checkIn =
                reservation.getCheckIn();

        this.checkOut =
                reservation.getCheckOut();

        this.guestCount =
                reservation.getGuestCount();

        this.quantity =
                reservation.getQuantity();

        this.totalPrice =
                reservation.getTotalPrice();

        this.depositAmount =
                reservation.getDepositAmount();

        this.status =
                reservation.getStatus();
    }
}