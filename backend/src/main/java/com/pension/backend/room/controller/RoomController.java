package com.pension.backend.room.controller;

import com.pension.backend.room.dto.*;
import com.pension.backend.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
@Tag(
        name = "객실",
        description = "사용자 객실 API"
)
public class RoomController {

    private final RoomService roomService;

    @Operation(summary = "전체 객실 조회")
    @GetMapping
    public List<RoomListResponse>
    getRooms() {
        return roomService.getRooms();
    }

    @Operation(summary = "객실 상세 조회")
    @GetMapping("/{roomId}")
    public RoomDetailResponse getRoom(
            @PathVariable Long roomId
    ) {
        return roomService.getRoom(
                roomId
        );
    }

    // 기존 프론트 호환용
    @Operation(
            summary = "객실 대표 이미지 조회"
    )
    @GetMapping("/{roomId}/image")
    public ResponseEntity<byte[]>
    getRoomImage(
            @PathVariable Long roomId
    ) {
        RoomImageResponse image =
                roomService.getRoomImage(
                        roomId
                );

        return createImageResponse(
                image
        );
    }

    @Operation(
            summary = "객실 이미지 목록 조회"
    )
    @GetMapping("/{roomId}/images")
    public List<RoomImageMetaResponse>
    getRoomImages(
            @PathVariable Long roomId
    ) {
        return roomService.getRoomImages(
                roomId
        );
    }

    @Operation(
            summary = "객실 이미지 조회"
    )
    @GetMapping(
            "/{roomId}/images/{imageId}"
    )
    public ResponseEntity<byte[]>
    getRoomImage(
            @PathVariable Long roomId,
            @PathVariable Long imageId
    ) {
        RoomImageResponse image =
                roomService.getRoomImage(
                        roomId,
                        imageId
                );

        return createImageResponse(
                image
        );
    }

    @Operation(
            summary = "월별 예약 정보 조회",
            description = "날짜별 가격과 잔여 수량을 조회합니다."
    )
    @GetMapping(
            "/{roomId}/availability"
    )
    public RoomAvailabilityResponse
    getAvailability(
            @PathVariable Long roomId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return roomService.getAvailability(
                roomId,
                year,
                month
        );
    }

    @Operation(
            summary = "예약 가능 여부 확인",
            description = "수량을 포함하여 예약 가능 여부와 총 금액을 확인합니다."
    )
    @GetMapping(
            "/{roomId}/availability/check"
    )
    public RoomAvailabilityCheckResponse
    checkAvailability(
            @PathVariable Long roomId,

            @RequestParam
            LocalDate checkIn,

            @RequestParam
            LocalDate checkOut,

            @Parameter(
                    description = "예약 수량",
                    example = "2"
            )
            @RequestParam(
                    defaultValue = "1"
            )
            int quantity
    ) {
        return roomService
                .checkAvailability(
                        roomId,
                        checkIn,
                        checkOut,
                        quantity
                );
    }

    private ResponseEntity<byte[]>
    createImageResponse(
            RoomImageResponse image
    ) {
        return ResponseEntity
                .ok()
                .cacheControl(
                        CacheControl.noStore()
                )
                .contentType(
                        MediaType.parseMediaType(
                                image.getContentType()
                        )
                )
                .body(
                        image.getData()
                );
    }
}