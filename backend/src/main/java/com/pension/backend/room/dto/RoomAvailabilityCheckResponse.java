package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "객실 예약 가능 여부 확인 응답")
public class RoomAvailabilityCheckResponse {

    @Schema(
            description = "예약 가능 여부",
            example = "true"
    )
    private boolean available;

    @Schema(
            description = "선택한 숙박 기간의 총 금액. 예약 불가능한 경우 null",
            example = "750000",
            nullable = true
    )
    private Long totalPrice;
}