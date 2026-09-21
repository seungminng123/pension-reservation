package com.pension.backend.price.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
@Schema(description = "날짜별 객실 판매 가격")
public class RoomDailyPriceResponse {

    @Schema(example = "2026-10-03")
    private LocalDate date;

    @Schema(example = "250000")
    private Long price;

    @Schema(
            description = "관리자가 별도 설정한 가격인지 여부",
            example = "true"
    )
    private boolean customPrice;
}