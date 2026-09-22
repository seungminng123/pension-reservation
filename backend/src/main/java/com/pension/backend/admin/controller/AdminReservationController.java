package com.pension.backend.admin.controller;

import com.pension.backend.reservation.dto.AdminReservationCalendarDayResponse;
import com.pension.backend.reservation.dto.AdminReservationCalendarItemResponse;
import com.pension.backend.reservation.dto.AdminReservationDetailResponse;
import com.pension.backend.reservation.dto.AdminReservationListResponse;
import com.pension.backend.reservation.dto.AdminReservationMemoRequest;
import com.pension.backend.reservation.dto.ReservationConfirmRequest;
import com.pension.backend.reservation.dto.ReservationStatusResponse;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(
        "/api/v1/admin/reservations"
)
@Tag(
        name = "관리자 예약",
        description = "관리자 예약 및 예약 캘린더 API"
)
@SecurityRequirement(
        name = "bearerAuth"
)
public class AdminReservationController {

    private final ReservationService
            reservationService;

    // 예약 목록 조회
    @Operation(
            summary = "예약 목록 조회"
    )
    @GetMapping
    public List<AdminReservationListResponse>
    getReservations(
            @Parameter(
                    description = "예약 상태 필터. 생략 시 전체 조회"
            )
            @RequestParam(required = false)
            ReservationStatus status
    ) {
        return reservationService
                .getAdminReservations(
                        status
                );
    }

    // 월별 예약 캘린더 조회
    @Operation(
            summary = "월별 예약 캘린더 조회"
    )
    @GetMapping("/calendar")
    public List<AdminReservationCalendarDayResponse>
    getReservationCalendar(
            @Parameter(
                    example = "2026"
            )
            @RequestParam
            int year,

            @Parameter(
                    example = "9"
            )
            @RequestParam
            int month
    ) {
        return reservationService
                .getAdminReservationCalendar(
                        year,
                        month
                );
    }

    // 특정 날짜 예약 조회
    @Operation(
            summary = "특정 날짜 예약 조회",
            description = "해당 날짜에 이용 중인 예약을 조회합니다."
    )
    @GetMapping(
            "/calendar/{date}"
    )
    public List<AdminReservationCalendarItemResponse>
    getReservationsByDate(
            @PathVariable
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {
        return reservationService
                .getAdminReservationsByDate(
                        date
                );
    }

    // 예약 상세 조회
    @Operation(
            summary = "예약 상세 조회"
    )
    @GetMapping(
            "/{reservationId}"
    )
    public AdminReservationDetailResponse
    getReservation(
            @PathVariable
            Long reservationId
    ) {
        return reservationService
                .getAdminReservation(
                        reservationId
                );
    }

    // 관리자 메모 수정
    @Operation(
            summary = "관리자 예약 메모 수정",
            description = "관리자만 확인할 수 있는 예약 메모를 저장하거나 수정합니다."
    )
    @PatchMapping(
            "/{reservationId}/memo"
    )
    public AdminReservationDetailResponse
    updateReservationMemo(
            @PathVariable
            Long reservationId,

            @Valid
            @RequestBody
            AdminReservationMemoRequest request
    ) {
        return reservationService
                .updateAdminMemo(
                        reservationId,
                        request.getMemo()
                );
    }

    // 예약 확정
    @Operation(
            summary = "예약 확정",
            description = "카드 또는 현금 결제 수단을 선택한 뒤 예약을 확정합니다."
    )
    @PatchMapping(
            "/{reservationId}/confirm"
    )
    public ReservationStatusResponse
    confirmReservation(
            @PathVariable
            Long reservationId,

            @Valid
            @RequestBody
            ReservationConfirmRequest request
    ) {
        return reservationService
                .confirmReservation(
                        reservationId,
                        request.getPaymentMethod()
                );
    }

    // 예약 취소
    @Operation(
            summary = "예약 취소"
    )
    @PatchMapping(
            "/{reservationId}/cancel"
    )
    public ReservationStatusResponse
    cancelReservation(
            @PathVariable
            Long reservationId
    ) {
        return reservationService
                .cancelReservation(
                        reservationId
                );
    }
}