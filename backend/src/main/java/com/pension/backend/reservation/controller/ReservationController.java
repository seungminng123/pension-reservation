package com.pension.backend.reservation.controller;

import com.pension.backend.reservation.dto.*;
import com.pension.backend.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reservations")
@Tag(name = "예약", description = "사용자 예약 API")
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(
            summary = "예약 신청",
            description = "객실과 날짜를 선택하여 예약을 신청합니다. 최초 상태는 PENDING입니다."
    )
    @PostMapping
    public ReservationResponse createReservation(
            @Valid @RequestBody ReservationCreateRequest request
    ) {
        return reservationService.createReservation(request);
    }

    @Operation(
            summary = "예약 조회",
            description = "예약번호와 전화번호로 예약을 조회합니다. 전화번호가 URL에 노출되지 않도록 POST를 사용합니다."
    )
    @PostMapping("/lookup")
    public ReservationResponse lookupReservation(
            @Valid @RequestBody ReservationLookupRequest request
    ) {
        return reservationService.lookupReservation(request);
    }

    @Operation(summary = "예약 취소 요청")
    @PatchMapping("/{reservationNumber}/cancel-request")
    public ReservationStatusResponse requestCancel(
            @Parameter(example = "R20261003120000ABC123")
            @PathVariable String reservationNumber,

            @Valid @RequestBody ReservationCancelRequest request
    ) {
        return reservationService.requestCancel(
                reservationNumber,
                request
        );
    }
}