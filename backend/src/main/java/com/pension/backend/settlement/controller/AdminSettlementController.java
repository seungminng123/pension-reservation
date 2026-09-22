package com.pension.backend.admin.controller;

import com.pension.backend.settlement.dto.DailySettlementResponse;
import com.pension.backend.settlement.dto.MonthlySettlementResponse;
import com.pension.backend.settlement.service.SettlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping(
        "/api/v1/admin/settlements"
)
@Tag(
        name = "관리자 정산",
        description = "관리자 일일 및 월별 정산 API"
)
@SecurityRequirement(
        name = "bearerAuth"
)
public class AdminSettlementController {

    private final SettlementService
            settlementService;

    @Operation(
            summary = "일일 정산 조회",
            description = "관리자가 예약을 확정한 날짜를 기준으로 카드/현금 매출을 조회합니다."
    )
    @GetMapping("/daily")
    public DailySettlementResponse
    getDailySettlement(
            @Parameter(
                    example = "2026-09-22"
            )
            @RequestParam
            @DateTimeFormat(
                    iso =
                            DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {
        return settlementService
                .getDailySettlement(
                        date
                );
    }

    @Operation(
            summary = "월별 정산 조회",
            description = "관리자가 예약을 확정한 날짜를 기준으로 월별 카드/현금 매출을 조회합니다."
    )
    @GetMapping("/monthly")
    public MonthlySettlementResponse
    getMonthlySettlement(
            @Parameter(example = "2026")
            @RequestParam
            int year,

            @Parameter(example = "9")
            @RequestParam
            int month
    ) {
        return settlementService
                .getMonthlySettlement(
                        year,
                        month
                );
    }
}