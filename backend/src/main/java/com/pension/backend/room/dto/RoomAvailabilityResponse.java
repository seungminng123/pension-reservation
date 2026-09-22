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

    private Long roomId;

    private int year;

    private int month;

    @Schema(
            description = "재고가 모두 소진된 날짜"
    )
    private List<LocalDate> unavailableDates;

    @Schema(
            description = "날짜별 실제 가격"
    )
    private List<RoomDailyPriceResponse> dailyPrices;

    @Schema(
            description = "날짜별 잔여 수량"
    )
    private List<RoomDailyStockResponse> dailyStocks;
}