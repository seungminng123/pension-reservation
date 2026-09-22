package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
@Schema(description = "날짜별 객실 잔여 수량")
public class RoomDailyStockResponse {

    @Schema(example = "2026-10-03")
    private LocalDate date;

    @Schema(example = "3")
    private Integer remainingCount;

    @Schema(example = "false")
    private boolean soldOut;
}