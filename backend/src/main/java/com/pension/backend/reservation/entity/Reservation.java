package com.pension.backend.reservation.entity;

import com.pension.backend.room.entity.Room;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reservationId;

    @Column(
            nullable = false,
            unique = true
    )
    private String reservationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "room_id",
            nullable = false
    )
    private Room room;

    @Column(nullable = false)
    private String guestName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String depositorName;

    @Column(nullable = false)
    private Integer guestCount;

    @Column(
            nullable = false,
            columnDefinition = "INT NOT NULL DEFAULT 1"
    )
    private Integer quantity = 1;

    @Column(nullable = false)
    private LocalDate checkIn;

    @Column(nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false)
    private Long totalPrice;

    @Column(nullable = false)
    private Long depositAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    // 결제 수단
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    // 관리자 예약 확정 시간
    private LocalDateTime confirmedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Reservation(
            String reservationNumber,
            Room room,
            String guestName,
            String phoneNumber,
            String depositorName,
            Integer guestCount,
            Integer quantity,
            LocalDate checkIn,
            LocalDate checkOut,
            Long totalPrice,
            Long depositAmount
    ) {
        this.reservationNumber =
                reservationNumber;

        this.room =
                room;

        this.guestName =
                guestName;

        this.phoneNumber =
                phoneNumber;

        this.depositorName =
                depositorName;

        this.guestCount =
                guestCount;

        this.quantity =
                quantity;

        this.checkIn =
                checkIn;

        this.checkOut =
                checkOut;

        this.totalPrice =
                totalPrice;

        this.depositAmount =
                depositAmount;

        this.status =
                ReservationStatus.PENDING;
    }

    // 취소 요청
    public void requestCancel() {

        if (
                status ==
                        ReservationStatus.CANCELED
        ) {
            throw new IllegalStateException(
                    "이미 취소된 예약입니다."
            );
        }

        if (
                status !=
                        ReservationStatus.CANCEL_REQUESTED
        ) {
            status =
                    ReservationStatus.CANCEL_REQUESTED;
        }
    }

    // 예약 확정
    public void confirm(
            PaymentMethod paymentMethod
    ) {

        if (
                status !=
                        ReservationStatus.PENDING
        ) {
            throw new IllegalStateException(
                    "입금 대기 상태의 예약만 확정할 수 있습니다."
            );
        }

        if (paymentMethod == null) {
            throw new IllegalArgumentException(
                    "결제 수단을 선택해 주세요."
            );
        }

        this.paymentMethod =
                paymentMethod;

        this.confirmedAt =
                LocalDateTime.now();

        this.status =
                ReservationStatus.CONFIRMED;
    }

    // 예약 취소
    public void cancel() {

        status =
                ReservationStatus.CANCELED;
    }
}