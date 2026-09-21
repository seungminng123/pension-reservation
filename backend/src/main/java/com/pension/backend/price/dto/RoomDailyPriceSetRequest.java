package com.pension.backend.price.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
@Schema(description = "객실 날짜별 요금 설정 요청")
public class RoomDailyPriceSetRequest {

    @NotEmpty
    @Schema(
            description = "가격을 적용할 날짜 목록",
            example = "[\"2026-10-03\", \"2026-10-04\"]"
    )
    private List<@NotNull LocalDate> dates;

    @NotNull
    @Positive
    @Schema(
            description = "적용할 1박 가격",
            example = "250000"
    )
    private Long price;
}