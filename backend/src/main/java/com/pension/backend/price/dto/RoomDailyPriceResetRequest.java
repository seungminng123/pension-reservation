package com.pension.backend.price.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
@Schema(description = "객실 날짜별 요금 초기화 요청")
public class RoomDailyPriceResetRequest {

    @NotEmpty
    @Schema(
            description = "기본 객실 가격으로 되돌릴 날짜",
            example = "[\"2026-10-03\", \"2026-10-04\"]"
    )
    private List<@NotNull LocalDate> dates;
}