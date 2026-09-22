package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;

@Getter
@Schema(description = "관리자 객실 등록 요청")
public class RoomCreateRequest {

    @NotBlank
    @Schema(example = "PYEONGSANG")
    private String type;

    @NotBlank
    @Schema(example = "대형 평상")
    private String name;

    @Schema(example = "계곡 앞 대형 평상입니다.")
    private String description;

    @NotNull
    @Positive
    @Schema(example = "50000")
    private Long price;

    @NotNull
    @Positive
    @Schema(example = "6")
    private Integer maxGuests;

    @NotNull
    @Positive
    @Schema(example = "4")
    private Integer guestCount;

    @Positive
    @Schema(
            description = "전체 재고 수량",
            example = "8"
    )
    private Integer stockCount = 1;

    @Schema(
            description = "판매 여부",
            example = "true"
    )
    private Boolean saleEnabled = true;
}