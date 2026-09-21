package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "예약 상태 변경 응답")
public class ReservationStatusResponse {

    private final String reservationNumber;
    private final ReservationStatus status;

    public ReservationStatusResponse(Reservation reservation) {
        this.reservationNumber = reservation.getReservationNumber();
        this.status = reservation.getStatus();
    }
}