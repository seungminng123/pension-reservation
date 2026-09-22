package com.pension.backend.room.dto;

import com.pension.backend.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "전체 객실 조회 응답")
public class RoomListResponse {

    @Schema(example = "1")
    private final Long roomId;

    @Schema(example = "PYEONGSANG")
    private final String type;

    @Schema(example = "대형 평상")
    private final String name;

    @Schema(example = "50000")
    private final Long price;

    @Schema(example = "6")
    private final Integer maxGuests;

    @Schema(example = "4")
    private final Integer guestCount;

    @Schema(
            description = "전체 재고 수량",
            example = "8"
    )
    private final Integer stockCount;

    @Schema(
            description = "판매 여부",
            example = "true"
    )
    private final boolean saleEnabled;

    @Schema(
            description = "이미지 존재 여부",
            example = "true"
    )
    private final boolean hasImage;

    public RoomListResponse(
            Room room,
            boolean hasImage
    ) {
        this.roomId =
                room.getRoomId();

        this.type =
                room.getType();

        this.name =
                room.getName();

        this.price =
                room.getPrice();

        this.maxGuests =
                room.getMaxGuests();

        this.guestCount =
                room.getGuestCount();

        this.stockCount =
                room.getStockCount();

        this.saleEnabled =
                room.isSaleEnabled();

        this.hasImage =
                hasImage;
    }
}