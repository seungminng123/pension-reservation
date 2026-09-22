package com.pension.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
@Schema(description = "객실 이미지 순서 변경 요청")
public class RoomImageOrderRequest {

    @NotEmpty
    @Schema(
            description = "표시할 순서대로 이미지 ID 전달",
            example = "[3, 1, 2]"
    )
    private List<@NotNull Long> imageIds;
}