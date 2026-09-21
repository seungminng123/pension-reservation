package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import lombok.Getter;

@Getter
@Schema(description = "관리자 객실 수정 요청")
public class RoomUpdateRequest {

    @Schema(example = "DELUXE")
    private String type;

    @Schema(example = "101호")
    private String name;

    @Schema(example = "객실 설명 수정")
    private String description;

    @Positive
    @Schema(example = "150000")
    private Long price;

    @Positive
    @Schema(example = "4")
    private Integer maxGuests;

    @Positive
    @Schema(example = "2")
    private Integer guestCount;

    @Schema(example = "https://example.com/new-room.jpg")
    private String imageUrl;
}