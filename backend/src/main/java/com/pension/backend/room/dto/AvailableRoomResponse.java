package com.pension.backend.room.dto;

import com.pension.backend.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "선택 기간 예약 가능 상품 응답")
public class AvailableRoomResponse {

    private final Long roomId;

    @Schema(
            allowableValues = {
                    "ROOM",
                    "PYEONGSANG"
            },
            example = "ROOM"
    )
    private final String type;

    private final String name;

    @Schema(
            description = "기본 1박 가격",
            example = "80000"
    )
    private final Long price;

    private final Integer guestCount;

    private final Integer maxGuests;

    private final Integer stockCount;

    @Schema(
            description = "선택 기간 중 가장 적은 잔여 수량",
            example = "7"
    )
    private final Integer remainingCount;

    @Schema(
            description = "선택 기간 예약 가능 여부",
            example = "true"
    )
    private final boolean available;

    @Schema(
            description = "선택 기간 1개 기준 총 금액",
            example = "160000"
    )
    private final Long totalPrice;

    private final boolean hasImage;

    public AvailableRoomResponse(
            Room room,
            Integer remainingCount,
            Long totalPrice,
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

        this.guestCount =
                room.getGuestCount();

        this.maxGuests =
                room.getMaxGuests();

        this.stockCount =
                room.getStockCount();

        this.remainingCount =
                remainingCount;

        this.available =
                remainingCount > 0;

        this.totalPrice =
                totalPrice;

        this.hasImage =
                hasImage;
    }
}