package com.pension.backend.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
@Schema(description = "예약 취소 요청")
public class ReservationCancelRequest {

    @NotBlank
    @Schema(example = "01012345678")
    private String phoneNumber;
}