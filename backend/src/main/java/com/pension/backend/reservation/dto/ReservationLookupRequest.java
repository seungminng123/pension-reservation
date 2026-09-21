package com.pension.backend.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
@Schema(description = "예약 조회 요청")
public class ReservationLookupRequest {

    @NotBlank
    @Schema(example = "R20261003120000ABC123")
    private String reservationNumber;

    @NotBlank
    @Schema(example = "01012345678")
    private String phoneNumber;
}