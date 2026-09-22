package com.pension.backend.reservation.controller;

import com.pension.backend.reservation.dto.ReservationCancelRequest;
import com.pension.backend.reservation.dto.ReservationCreateRequest;
import com.pension.backend.reservation.dto.ReservationLookupRequest;
import com.pension.backend.reservation.dto.ReservationResponse;
import com.pension.backend.reservation.dto.ReservationStatusResponse;
import com.pension.backend.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reservations")
@Tag(
        name = "예약",
        description = "사용자 예약 API"
)
public class ReservationController {

    private final ReservationService reservationService;

    // 예약 생성
    @Operation(
            summary = "예약 신청",
            description = "상품과 날짜, 예약자 정보를 입력해 예약을 신청합니다."
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse createReservation(
            @Valid
            @RequestBody
            ReservationCreateRequest request
    ) {
        return reservationService
                .createReservation(
                        request
                );
    }

    // 예약 조회
    @Operation(
            summary = "예약 조회",
            description = "예약번호와 전화번호로 예약을 조회합니다."
    )
    @PostMapping("/lookup")
    public ReservationResponse lookupReservation(
            @Valid
            @RequestBody
            ReservationLookupRequest request
    ) {
        return reservationService
                .lookupReservation(
                        request.getReservationNumber(),
                        request.getPhoneNumber()
                );
    }

    // 예약 취소 요청
    @Operation(
            summary = "예약 취소 요청",
            description = "예약번호와 전화번호를 확인한 후 예약 취소를 요청합니다."
    )
    @PatchMapping(
            "/{reservationNumber}/cancel-request"
    )
    public ReservationStatusResponse requestCancel(
            @Parameter(
                    description = "예약번호",
                    example = "R20260922120000ABC123"
            )
            @PathVariable
            String reservationNumber,

            @Valid
            @RequestBody
            ReservationCancelRequest request
    ) {
        return reservationService
                .requestCancel(
                        reservationNumber,
                        request.getPhoneNumber()
                );
    }
}