package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.PaymentMethod;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class AdminReservationDetailResponse {

    private final Long reservationId;
    private final String reservationNumber;

    private final String guestName;
    private final String phoneNumber;
    private final String depositorName;

    private final Long roomId;
    private final String roomName;
    private final String roomType;

    private final LocalDate checkIn;
    private final LocalDate checkOut;

    private final Integer guestCount;
    private final Integer quantity;

    private final Long totalPrice;
    private final Long depositAmount;

    private final ReservationStatus status;

    private final PaymentMethod paymentMethod;
    private final LocalDateTime confirmedAt;

    private final LocalDateTime createdAt;

    public AdminReservationDetailResponse(
            Reservation reservation
    ) {
        this.reservationId =
                reservation.getReservationId();

        this.reservationNumber =
                reservation.getReservationNumber();

        this.guestName =
                reservation.getGuestName();

        this.phoneNumber =
                reservation.getPhoneNumber();

        this.depositorName =
                reservation.getDepositorName();

        this.roomId =
                reservation.getRoom().getRoomId();

        this.roomName =
                reservation.getRoom().getName();

        this.roomType =
                reservation.getRoom().getType();

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

        this.paymentMethod =
                reservation.getPaymentMethod();

        this.confirmedAt =
                reservation.getConfirmedAt();

        this.createdAt =
                reservation.getCreatedAt();
    }
}