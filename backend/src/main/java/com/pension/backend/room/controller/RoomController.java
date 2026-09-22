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

    // 전체 객실 조회
    @Operation(
            summary = "전체 객실 조회",
            description = "현재 판매 중인 방과 평상 목록을 조회합니다."
    )
    @GetMapping
    public List<RoomListResponse>
    getRooms() {
        return roomService
                .getRooms();
    }

    // 선택 기간 예약 가능 상품 조회
    @Operation(
            summary = "선택 기간 예약 가능 상품 조회",
            description = """
                    체크인과 체크아웃 날짜를 먼저 선택한 뒤
                    판매 중인 방과 평상의 잔여 수량 및
                    선택 기간 총 금액을 조회합니다.
                    """
    )
    @GetMapping("/available")
    public List<AvailableRoomResponse>
    getAvailableRooms(

            @Parameter(
                    description = "체크인 날짜",
                    example = "2026-09-26"
            )
            @RequestParam
            LocalDate checkIn,

            @Parameter(
                    description = "체크아웃 날짜",
                    example = "2026-09-27"
            )
            @RequestParam
            LocalDate checkOut
    ) {
        return roomService
                .getAvailableRooms(
                        checkIn,
                        checkOut
                );
    }

    // 객실 상세 조회
    @Operation(
            summary = "객실 상세 조회"
    )
    @GetMapping("/{roomId}")
    public RoomDetailResponse
    getRoom(
            @PathVariable
            Long roomId
    ) {
        return roomService
                .getRoom(
                        roomId
                );
    }

    // 기존 프론트 호환용 대표 이미지
    @Operation(
            summary = "객실 대표 이미지 조회",
            description = "등록된 이미지 중 첫 번째 이미지를 대표 이미지로 조회합니다."
    )
    @GetMapping("/{roomId}/image")
    public ResponseEntity<byte[]>
    getRoomImage(
            @PathVariable
            Long roomId
    ) {
        RoomImageResponse image =
                roomService
                        .getRoomImage(
                                roomId
                        );

        return createImageResponse(
                image
        );
    }

    // 이미지 목록 조회
    @Operation(
            summary = "객실 이미지 목록 조회"
    )
    @GetMapping("/{roomId}/images")
    public List<RoomImageMetaResponse>
    getRoomImages(
            @PathVariable
            Long roomId
    ) {
        return roomService
                .getRoomImages(
                        roomId
                );
    }

    // 특정 이미지 조회
    @Operation(
            summary = "객실 이미지 조회"
    )
    @GetMapping(
            "/{roomId}/images/{imageId}"
    )
    public ResponseEntity<byte[]>
    getRoomImage(
            @PathVariable
            Long roomId,

            @PathVariable
            Long imageId
    ) {
        RoomImageResponse image =
                roomService
                        .getRoomImage(
                                roomId,
                                imageId
                        );

        return createImageResponse(
                image
        );
    }

    // 월별 예약 정보 조회
    @Operation(
            summary = "월별 예약 정보 조회",
            description = """
                    특정 상품의 월별 날짜 가격,
                    잔여 수량,
                    예약 마감 여부를 조회합니다.
                    """
    )
    @GetMapping(
            "/{roomId}/availability"
    )
    public RoomAvailabilityResponse
    getAvailability(
            @PathVariable
            Long roomId,

            @Parameter(
                    description = "조회 연도",
                    example = "2026"
            )
            @RequestParam
            int year,

            @Parameter(
                    description = "조회 월",
                    example = "9"
            )
            @RequestParam
            int month
    ) {
        return roomService
                .getAvailability(
                        roomId,
                        year,
                        month
                );
    }

    // 예약 가능 여부 확인
    @Operation(
            summary = "예약 가능 여부 확인",
            description = """
                    특정 상품에 대해 체크인,
                    체크아웃, 예약 수량을 기준으로
                    예약 가능 여부와 총 금액을 확인합니다.
                    """
    )
    @GetMapping(
            "/{roomId}/availability/check"
    )
    public RoomAvailabilityCheckResponse
    checkAvailability(
            @PathVariable
            Long roomId,

            @Parameter(
                    description = "체크인 날짜",
                    example = "2026-09-26"
            )
            @RequestParam
            LocalDate checkIn,

            @Parameter(
                    description = "체크아웃 날짜",
                    example = "2026-09-27"
            )
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

    // 이미지 응답 생성
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