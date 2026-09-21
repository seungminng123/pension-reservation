package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "객실 예약 가능 여부 확인 응답")
public class RoomAvailabilityCheckResponse {

    @Schema(example = "true")
    private final boolean available;

    public RoomAvailabilityCheckResponse(boolean available) {
        this.available = available;
    }
}