package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Schema(description = "객실 예약 불가 날짜 조회 응답")
public class RoomAvailabilityResponse {

    @Schema(description = "객실 ID", example = "1")
    private final Long roomId;

    @Schema(description = "조회 연도", example = "2026")
    private final Integer year;

    @Schema(description = "조회 월", example = "10")
    private final Integer month;

    @Schema(
            description = "예약 불가 날짜 목록",
            example = "[\"2026-10-03\", \"2026-10-04\"]"
    )
    private final List<LocalDate> unavailableDates;

    public RoomAvailabilityResponse(
            Long roomId,
            Integer year,
            Integer month,
            List<LocalDate> unavailableDates
    ) {
        this.roomId = roomId;
        this.year = year;
        this.month = month;
        this.unavailableDates = unavailableDates;
    }
}