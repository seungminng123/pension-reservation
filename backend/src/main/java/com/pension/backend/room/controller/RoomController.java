package com.pension.backend.room.controller;

import com.pension.backend.room.dto.RoomAvailabilityCheckResponse;
import com.pension.backend.room.dto.RoomAvailabilityResponse;
import com.pension.backend.room.dto.RoomDetailResponse;
import com.pension.backend.room.dto.RoomImageResponse;
import com.pension.backend.room.dto.RoomListResponse;
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
@Tag(name = "객실", description = "사용자 객실 API")
public class RoomController {

    private final RoomService roomService;

    @Operation(summary = "전체 객실 조회")
    @GetMapping
    public List<RoomListResponse> getRooms() {
        return roomService.getRooms();
    }

    @Operation(summary = "객실 상세 조회")
    @GetMapping("/{roomId}")
    public RoomDetailResponse getRoom(
            @Parameter(example = "1")
            @PathVariable Long roomId
    ) {
        return roomService.getRoom(roomId);
    }

    @Operation(summary = "객실 이미지 조회")
    @GetMapping("/{roomId}/image")
    public ResponseEntity<byte[]> getRoomImage(
            @Parameter(example = "1")
            @PathVariable Long roomId
    ) {
        RoomImageResponse image =
                roomService.getRoomImage(
                        roomId
                );

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

    @Operation(
            summary = "객실 예약 불가 날짜 조회",
            description = "해당 연도와 월의 예약 불가 날짜와 날짜별 가격을 조회합니다."
    )
    @GetMapping("/{roomId}/availability")
    public RoomAvailabilityResponse getAvailability(
            @Parameter(example = "1")
            @PathVariable Long roomId,

            @Parameter(example = "2026")
            @RequestParam int year,

            @Parameter(example = "10")
            @RequestParam int month
    ) {
        return roomService.getAvailability(
                roomId,
                year,
                month
        );
    }

    @Operation(
            summary = "객실 예약 가능 여부 확인",
            description = "선택한 체크인/체크아웃 기간의 예약 가능 여부와 총 금액을 확인합니다."
    )
    @GetMapping("/{roomId}/availability/check")
    public RoomAvailabilityCheckResponse checkAvailability(
            @Parameter(example = "1")
            @PathVariable Long roomId,

            @Parameter(example = "2026-10-05")
            @RequestParam LocalDate checkIn,

            @Parameter(example = "2026-10-07")
            @RequestParam LocalDate checkOut
    ) {
        return roomService.checkAvailability(
                roomId,
                checkIn,
                checkOut
        );
    }
}