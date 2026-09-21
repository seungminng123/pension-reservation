package com.pension.backend.price.controller;

import com.pension.backend.price.dto.*;
import com.pension.backend.price.service.RoomDailyPriceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/rooms/{roomId}/prices")
@SecurityRequirement(name = "bearerAuth")
public class AdminRoomPriceController {

    private final RoomDailyPriceService roomDailyPriceService;

    @Operation(
            summary = "객실 월별 요금 조회",
            description = "관리자 요금 달력에 표시할 날짜별 실제 판매 가격을 조회합니다."
    )
    @GetMapping
    public RoomMonthlyPriceResponse getMonthlyPrices(
            @Parameter(description = "객실 ID")
            @PathVariable Long roomId,

            @Parameter(example = "2026")
            @RequestParam int year,

            @Parameter(example = "10")
            @RequestParam int month
    ) {
        return roomDailyPriceService
                .getMonthlyPrices(
                        roomId,
                        year,
                        month
                );
    }

    @Operation(
            summary = "날짜별 객실 요금 설정",
            description = "선택한 여러 날짜에 동일한 판매 가격을 일괄 적용합니다."
    )
    @PutMapping
    public RoomMonthlyPriceResponse setPrices(
            @PathVariable Long roomId,

            @Valid
            @RequestBody
            RoomDailyPriceSetRequest request
    ) {
        return roomDailyPriceService
                .setPrices(
                        roomId,
                        request
                );
    }

    @Operation(
            summary = "날짜별 객실 요금 초기화",
            description = "선택한 날짜의 별도 요금을 삭제하고 객실 기본 요금으로 되돌립니다."
    )
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPrices(
            @PathVariable Long roomId,

            @Valid
            @RequestBody
            RoomDailyPriceResetRequest request
    ) {
        roomDailyPriceService
                .resetPrices(
                        roomId,
                        request
                );
    }
}