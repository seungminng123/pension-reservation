package com.pension.backend.admin.controller;

import com.pension.backend.room.dto.*;
import com.pension.backend.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/rooms")
@Tag(name = "관리자 객실")
@SecurityRequirement(name = "bearerAuth")
public class AdminRoomController {

    private final RoomService roomService;

    @Operation(summary = "관리자 객실 목록 조회")
    @GetMapping
    public List<RoomListResponse> getRooms() {
        return roomService.getRooms();
    }

    @Operation(summary = "객실 등록")
    @PostMapping
    public RoomDetailResponse createRoom(
            @Valid @RequestBody RoomCreateRequest request
    ) {
        return roomService.createRoom(request);
    }

    @Operation(summary = "객실 수정")
    @PatchMapping("/{roomId}")
    public RoomDetailResponse updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomUpdateRequest request
    ) {
        return roomService.updateRoom(roomId, request);
    }
}