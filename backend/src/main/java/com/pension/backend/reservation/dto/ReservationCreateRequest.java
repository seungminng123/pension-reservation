package com.pension.backend.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Schema(description = "예약 신청 요청")
public class ReservationCreateRequest {

    @NotNull
    @Schema(example = "1")
    private Long roomId;

    @NotNull
    @Schema(example = "2026-10-03")
    private LocalDate checkIn;

    @NotNull
    @Schema(example = "2026-10-05")
    private LocalDate checkOut;

    @NotNull
    @Positive
    @Schema(
            description = "이용 인원",
            example = "4"
    )
    private Integer guestCount;

    @Positive
    @Schema(
            description = "예약 수량",
            example = "2"
    )
    private Integer quantity = 1;

    @NotBlank
    @Schema(example = "김승민")
    private String guestName;

    @NotBlank
    @Pattern(
            regexp =
                    "^01[016789]-?\\d{3,4}-?\\d{4}$"
    )
    @Schema(example = "01012345678")
    private String phoneNumber;

    @NotBlank
    @Schema(example = "김승민")
    private String depositorName;
}