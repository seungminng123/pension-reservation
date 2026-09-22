package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "객실 예약 가능 여부 확인 응답")
public class RoomAvailabilityCheckResponse {

    @Schema(example = "true")
    private boolean available;

    @Schema(
            description = "수량까지 적용한 총 가격",
            example = "220000",
            nullable = true
    )
    private Long totalPrice;

    @Schema(
            description = "선택 기간 중 가장 적은 잔여 수량",
            example = "3"
    )
    private Integer remainingCount;
}