package com.pension.backend.room.dto;

import com.pension.backend.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "객실 상세 조회 응답")
public class RoomDetailResponse {

    @Schema(description = "객실 ID", example = "1")
    private final Long roomId;

    @Schema(description = "객실 타입", example = "STANDARD")
    private final String type;

    @Schema(description = "객실명", example = "101호")
    private final String name;

    @Schema(
            description = "객실 설명",
            example = "기본 객실입니다."
    )
    private final String description;

    @Schema(description = "1박 가격", example = "120000")
    private final Long price;

    @Schema(description = "최대 인원", example = "4")
    private final Integer maxGuests;

    @Schema(description = "기준 인원", example = "2")
    private final Integer guestCount;

    @Schema(
            description = "객실 대표 이미지 URL",
            example = "https://image.ohousecdn.com/example.jpg"
    )
    private final String imageUrl;

    public RoomDetailResponse(Room room) {
        this.roomId = room.getRoomId();
        this.type = room.getType();
        this.name = room.getName();
        this.description = room.getDescription();
        this.price = room.getPrice();
        this.maxGuests = room.getMaxGuests();
        this.guestCount = room.getGuestCount();
        this.imageUrl = room.getImageUrl();
    }
}