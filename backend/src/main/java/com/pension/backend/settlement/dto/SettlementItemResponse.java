package com.pension.backend.settlement.dto;

import com.pension.backend.reservation.entity.PaymentMethod;
import com.pension.backend.reservation.entity.Reservation;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class SettlementItemResponse {

    private final Long reservationId;

    private final String reservationNumber;

    private final String roomType;

    private final String roomName;

    private final Integer quantity;

    private final Long totalPrice;

    private final PaymentMethod paymentMethod;

    private final LocalDateTime confirmedAt;

    public SettlementItemResponse(
            Reservation reservation
    ) {
        this.reservationId =
                reservation.getReservationId();

        this.reservationNumber =
                reservation.getReservationNumber();

        this.roomType =
                reservation.getRoom().getType();

        this.roomName =
                reservation.getRoom().getName();

        this.quantity =
                reservation.getQuantity();

        this.totalPrice =
                reservation.getTotalPrice();

        this.paymentMethod =
                reservation.getPaymentMethod();

        this.confirmedAt =
                reservation.getConfirmedAt();
    }
}