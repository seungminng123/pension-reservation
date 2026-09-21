package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
@Schema(description = "관리자 객실 등록 요청")
public class RoomCreateRequest {

    @NotBlank
    @Schema(example = "STANDARD")
    private String type;

    @NotBlank
    @Schema(example = "101호")
    private String name;

    @Schema(example = "기본 객실입니다.")
    private String description;

    @NotNull
    @Positive
    @Schema(example = "120000")
    private Long price;

    @NotNull
    @Positive
    @Schema(example = "4")
    private Integer maxGuests;

    @NotNull
    @Positive
    @Schema(example = "2")
    private Integer guestCount;

    @Schema(example = "https://example.com/room.jpg")
    private String imageUrl;
}