package com.pension.backend.room.dto;

import com.pension.backend.price.dto.RoomDailyPriceResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
@Schema(description = "객실 월별 예약 가능 정보")
public class RoomAvailabilityResponse {

    @Schema(
            description = "객실 ID",
            example = "1"
    )
    private Long roomId;

    @Schema(
            description = "조회 연도",
            example = "2026"
    )
    private int year;

    @Schema(
            description = "조회 월",
            example = "10"
    )
    private int month;

    @Schema(
            description = "예약이 불가능한 날짜 목록",
            example = """
                    [
                      "2026-10-12",
                      "2026-10-13"
                    ]
                    """
    )
    private List<LocalDate> unavailableDates;

    @Schema(
            description = "해당 월의 날짜별 실제 판매 가격"
    )
    private List<RoomDailyPriceResponse> dailyPrices;
}