package com.pension.backend.room.dto;

import com.pension.backend.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "객실 상세 조회 응답")
public class RoomDetailResponse {

    private final Long roomId;
    private final String type;
    private final String name;
    private final String description;
    private final Long price;
    private final Integer maxGuests;
    private final Integer guestCount;

    @Schema(example = "8")
    private final Integer stockCount;

    @Schema(example = "true")
    private final boolean saleEnabled;

    @Schema(example = "true")
    private final boolean hasImage;

    public RoomDetailResponse(
            Room room,
            boolean hasImage
    ) {
        this.roomId =
                room.getRoomId();

        this.type =
                room.getType();

        this.name =
                room.getName();

        this.description =
                room.getDescription();

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