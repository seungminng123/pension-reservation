package com.pension.backend.price.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Schema(description = "객실 월별 요금")
public class RoomMonthlyPriceResponse {

    private Long roomId;

    private int year;

    private int month;

    @Schema(
            description = "별도 가격이 없는 날짜에 적용되는 기본 가격",
            example = "180000"
    )
    private Long defaultPrice;

    private List<RoomDailyPriceResponse> prices;
}