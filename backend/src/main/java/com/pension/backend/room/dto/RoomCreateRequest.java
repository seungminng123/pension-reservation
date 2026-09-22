package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;

@Getter
@Schema(description = "관리자 객실 등록 요청")
public class RoomCreateRequest {

    @NotBlank
    @Pattern(
            regexp = "ROOM|PYEONGSANG",
            message = "상품 타입은 ROOM 또는 PYEONGSANG이어야 합니다."
    )
    @Schema(
            description = "상품 타입",
            allowableValues = {
                    "ROOM",
                    "PYEONGSANG"
            },
            example = "ROOM"
    )
    private String type;

    @NotBlank
    @Schema(example = "101호")
    private String name;

    @Schema(example = "계곡 전망 객실입니다.")
    private String description;

    @NotNull
    @Positive
    @Schema(example = "80000")
    private Long price;

    @NotNull
    @Positive
    @Schema(example = "4")
    private Integer maxGuests;

    @NotNull
    @Positive
    @Schema(example = "2")
    private Integer guestCount;

    @Positive
    @Schema(
            description = "전체 재고 수량",
            example = "10"
    )
    private Integer stockCount = 1;

    @Schema(
            description = "판매 여부",
            example = "true"
    )
    private Boolean saleEnabled = true;
}