package com.pension.backend.admin.controller;

import com.pension.backend.reservation.dto.*;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/reservations")
@Tag(name = "관리자 예약")
@SecurityRequirement(name = "bearerAuth")
public class AdminReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "예약 목록 조회")
    @GetMapping
    public List<AdminReservationListResponse> getReservations(
            @Parameter(
                    description = "예약 상태 필터. 생략 시 전체 조회"
            )
            @RequestParam(required = false)
            ReservationStatus status
    ) {
        return reservationService
                .getAdminReservations(status);
    }

    @Operation(summary = "예약 상세 조회")
    @GetMapping("/{reservationId}")
    public AdminReservationDetailResponse getReservation(
            @PathVariable Long reservationId
    ) {
        return reservationService
                .getAdminReservation(reservationId);
    }

    @Operation(
            summary = "예약 확정",
            description = "관리자가 예약금 입금을 확인한 뒤 예약을 확정합니다."
    )
    @PatchMapping("/{reservationId}/confirm")
    public ReservationStatusResponse confirmReservation(
            @PathVariable Long reservationId
    ) {
        return reservationService
                .confirmReservation(reservationId);
    }

    @Operation(summary = "예약 취소")
    @PatchMapping("/{reservationId}/cancel")
    public ReservationStatusResponse cancelReservation(
            @PathVariable Long reservationId
    ) {
        return reservationService
                .cancelReservation(reservationId);
    }
}