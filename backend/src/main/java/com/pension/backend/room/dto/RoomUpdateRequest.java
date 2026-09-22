package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import lombok.Getter;

@Getter
@Schema(description = "관리자 객실 수정 요청")
public class RoomUpdateRequest {

    @Schema(example = "PYEONGSANG")
    private String type;

    @Schema(example = "대형 평상")
    private String name;

    @Schema(example = "계곡 앞 평상")
    private String description;

    @Positive
    @Schema(example = "60000")
    private Long price;

    @Positive
    @Schema(example = "6")
    private Integer maxGuests;

    @Positive
    @Schema(example = "4")
    private Integer guestCount;

    @Positive
    @Schema(
            description = "전체 재고 수량",
            example = "8"
    )
    private Integer stockCount;

    @Schema(
            description = "판매 여부",
            example = "true"
    )
    private Boolean saleEnabled;
}