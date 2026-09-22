package com.pension.backend.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
@Schema(description = "관리자 예약 캘린더 일별 요약")
public class AdminReservationCalendarDayResponse {

    private LocalDate date;

    @Schema(
            description = "예약 건수",
            example = "4"
    )
    private Integer reservationCount;

    @Schema(
            description = "예약된 총 수량",
            example = "7"
    )
    private Integer reservedQuantity;

    @Schema(example = "1")
    private Integer pendingCount;

    @Schema(example = "2")
    private Integer confirmedCount;

    @Schema(example = "1")
    private Integer cancelRequestedCount;
}