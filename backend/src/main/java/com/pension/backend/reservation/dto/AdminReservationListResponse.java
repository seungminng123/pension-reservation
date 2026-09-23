package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.PaymentMethod;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Schema(
        description = "관리자 예약 목록 응답"
)
public class AdminReservationListResponse {

    @Schema(example = "1")
    private final Long reservationId;

    @Schema(
            description = "예약 번호",
            example = "R20260923123456ABCDEF"
    )
    private final String reservationNumber;

    @Schema(
            description = "예약자명",
            example = "김승민"
    )
    private final String guestName;

    @Schema(
            description = "예약자 전화번호",
            example = "010-1234-5678"
    )
    private final String phoneNumber;

    @Schema(
            description = "예약 인원",
            example = "4"
    )
    private final Integer guestCount;

    @Schema(
            description = "입금자명",
            example = "김승민"
    )
    private final String depositorName;

    @Schema(
            description = "예약 시설 ID",
            example = "1"
    )
    private final Long roomId;

    @Schema(
            description = "시설명",
            example = "평상 1"
    )
    private final String roomName;

    @Schema(
            description = "시설 유형",
            example = "PYEONGSANG"
    )
    private final String roomType;

    @Schema(
            description = "예약 수량",
            example = "1"
    )
    private final Integer quantity;

    @Schema(
            description = "이용 시작일",
            example = "2026-09-23"
    )
    private final LocalDate checkIn;

    @Schema(
            description = "이용 종료일",
            example = "2026-09-24"
    )
    private final LocalDate checkOut;

    @Schema(
            description = "전체 이용 금액",
            example = "50000"
    )
    private final Long totalPrice;

    @Schema(
            description = "예약금",
            example = "20000"
    )
    private final Long depositAmount;

    @Schema(
            description = "예약 상태",
            example = "PENDING"
    )
    private final ReservationStatus status;

    @Schema(
            description = "결제 수단"
    )
    private final PaymentMethod paymentMethod;

    @Schema(
            description = "예약 확정 시간"
    )
    private final LocalDateTime confirmedAt;

    @Schema(
            description = "예약 신청 시간"
    )
    private final LocalDateTime createdAt;

    public AdminReservationListResponse(
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

        this.guestCount =
                reservation.getGuestCount();

        this.depositorName =
                reservation.getDepositorName();

        this.roomId =
                reservation
                        .getRoom()
                        .getRoomId();

        this.roomName =
                reservation
                        .getRoom()
                        .getName();

        this.roomType =
                reservation
                        .getRoom()
                        .getType();

        this.quantity =
                reservation.getQuantity();

        this.checkIn =
                reservation.getCheckIn();

        this.checkOut =
                reservation.getCheckOut();

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