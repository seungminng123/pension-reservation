package com.pension.backend.room.dto;

import com.pension.backend.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "전체 객실 조회 응답")
public class RoomListResponse {

    @Schema(description = "객실 ID", example = "1")
    private final Long roomId;

    @Schema(description = "객실 타입", example = "STANDARD")
    private final String type;

    @Schema(description = "객실명", example = "101호")
    private final String name;

    @Schema(description = "1박 기본 가격", example = "120000")
    private final Long price;

    @Schema(description = "최대 인원", example = "4")
    private final Integer maxGuests;

    @Schema(description = "기준 인원", example = "2")
    private final Integer guestCount;

    @Schema(description = "객실 이미지 존재 여부", example = "true")
    private final boolean hasImage;

    public RoomListResponse(Room room) {
        this.roomId = room.getRoomId();
        this.type = room.getType();
        this.name = room.getName();
        this.price = room.getPrice();
        this.maxGuests = room.getMaxGuests();
        this.guestCount = room.getGuestCount();
        this.hasImage = room.getImageData() != null;
    }
}