package com.pension.backend.reservation.controller;

import com.pension.backend.reservation.dto.ReservationCancelRequest;
import com.pension.backend.reservation.dto.ReservationCreateRequest;
import com.pension.backend.reservation.dto.ReservationLookupRequest;
import com.pension.backend.reservation.dto.ReservationResponse;
import com.pension.backend.reservation.dto.ReservationStatusResponse;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.service.ReservationService;
import com.pension.backend.reservation.dto.AdminReservationPageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

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
    // 예약 검색 및 페이지 조회
    @Operation(
            summary = "예약 검색 및 페이지 조회",
            description = """
                관리자 예약 목록을 검색합니다.

                예약자명, 전화번호, 예약번호 검색과
                예약 상태, 이용 날짜 필터를 지원합니다.

                이용 날짜는 체크아웃 당일을 제외합니다.
                결과는 최신 예약순으로 반환됩니다.
                """
    )
    @GetMapping(
            "/search"
    )
    public AdminReservationPageResponse
    searchReservations(

            @Parameter(
                    description = "예약자명, 전화번호, 예약번호 검색어",
                    example = "김승민"
            )
            @RequestParam(required = false)
            String q,

            @Parameter(
                    description = "예약 상태. 생략 시 전체 상태 조회",
                    example = "PENDING"
            )
            @RequestParam(required = false)
            ReservationStatus status,

            @Parameter(
                    description = "이용 날짜",
                    example = "2026-09-23"
            )
            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,

            @Parameter(
                    description = "페이지 번호. 0부터 시작",
                    example = "0"
            )
            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @Parameter(
                    description = "페이지당 예약 수. 최대 100",
                    example = "20"
            )
            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {
        return reservationService
                .searchAdminReservations(
                        q,
                        status,
                        date,
                        page,
                        size
                );
    }
}