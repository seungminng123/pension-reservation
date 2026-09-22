package com.pension.backend.admin.controller;

import com.pension.backend.room.dto.*;
import com.pension.backend.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/rooms")
@Tag(
        name = "관리자 객실",
        description = "관리자 객실 관리 API"
)
@SecurityRequirement(
        name = "bearerAuth"
)
public class AdminRoomController {

    private final RoomService roomService;

    @Operation(
            summary = "관리자 객실 목록 조회"
    )
    @GetMapping
    public List<RoomListResponse>
    getRooms() {
        return roomService
                .getAdminRooms();
    }

    @Operation(summary = "객실 등록")
    @PostMapping
    public RoomDetailResponse
    createRoom(
            @Valid
            @RequestBody
            RoomCreateRequest request
    ) {
        return roomService.createRoom(
                request
        );
    }

    @Operation(summary = "객실 수정")
    @PatchMapping("/{roomId}")
    public RoomDetailResponse
    updateRoom(
            @PathVariable Long roomId,
            @Valid
            @RequestBody
            RoomUpdateRequest request
    ) {
        return roomService.updateRoom(
                roomId,
                request
        );
    }

    @Operation(
            summary = "객실 삭제",
            description = "객실을 실제 삭제하지 않고 비활성화합니다."
    )
    @DeleteMapping("/{roomId}")
    @ResponseStatus(
            HttpStatus.NO_CONTENT
    )
    public void deleteRoom(
            @PathVariable Long roomId
    ) {
        roomService.deleteRoom(
                roomId
        );
    }

    // 기존 프론트 호환용
    @Operation(
            summary = "객실 이미지 한 장 등록"
    )
    @PostMapping(
            value = "/{roomId}/image",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(
            HttpStatus.NO_CONTENT
    )
    public void uploadRoomImage(
            @PathVariable Long roomId,
            @RequestPart("file")
            MultipartFile file
    ) {
        roomService.uploadRoomImage(
                roomId,
                file
        );
    }

    @Operation(
            summary = "객실 이미지 여러 장 등록"
    )
    @PostMapping(
            value = "/{roomId}/images",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public List<RoomImageMetaResponse>
    uploadRoomImages(
            @PathVariable Long roomId,
            @RequestPart("files")
            List<MultipartFile> files
    ) {
        return roomService
                .uploadRoomImages(
                        roomId,
                        files
                );
    }

    @Operation(
            summary = "객실 이미지 삭제"
    )
    @DeleteMapping(
            "/{roomId}/images/{imageId}"
    )
    @ResponseStatus(
            HttpStatus.NO_CONTENT
    )
    public void deleteRoomImage(
            @PathVariable Long roomId,
            @PathVariable Long imageId
    ) {
        roomService.deleteRoomImage(
                roomId,
                imageId
        );
    }

    @Operation(
            summary = "객실 이미지 순서 변경",
            description = "첫 번째 이미지가 대표 이미지가 됩니다."
    )
    @PatchMapping(
            "/{roomId}/images/order"
    )
    public List<RoomImageMetaResponse>
    updateImageOrder(
            @PathVariable Long roomId,
            @Valid
            @RequestBody
            RoomImageOrderRequest request
    ) {
        return roomService
                .updateImageOrder(
                        roomId,
                        request
                );
    }
}