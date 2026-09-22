package com.pension.backend.room.dto;

import com.pension.backend.room.entity.RoomImage;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "객실 이미지 정보")
public class RoomImageMetaResponse {

    @Schema(example = "1")
    private final Long imageId;

    @Schema(example = "0")
    private final Integer displayOrder;

    public RoomImageMetaResponse(
            RoomImage roomImage
    ) {
        this.imageId =
                roomImage.getRoomImageId();

        this.displayOrder =
                roomImage.getDisplayOrder();
    }
}