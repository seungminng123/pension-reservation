package com.pension.backend.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Schema(description = "관리자 예약 캘린더 일별 요약")
public class AdminReservationCalendarDayResponse {

    @Schema(description = "이용 날짜 (체크아웃 날짜 제외)", example = "2026-09-28")
    private LocalDate date;

    @Schema(description = "방(ROOM)의 상태별 예약 건수. 수량 합계가 아니며 취소 요청/취소 완료 제외")
    private FacilityCounts room;

    @Schema(description = "평상(PYEONGSANG)의 상태별 예약 건수. 수량 합계가 아니며 취소 요청/취소 완료 제외")
    private FacilityCounts pyeongsang;

    @Schema(description = "방(ROOM)의 입금 확인 대기(PENDING) 예약 건수. 수량 합계가 아니며 없으면 0", example = "0")
    private final int roomPendingCount;

    @Schema(description = "방(ROOM)의 예약 확정(CONFIRMED) 건수. 없으면 0", example = "1")
    private final int roomConfirmedCount;

    @Schema(description = "평상(PYEONGSANG)의 입금 확인 대기(PENDING) 예약 건수. 수량 합계가 아니며 없으면 0", example = "1")
    private final int pyeongsangPendingCount;

    @Schema(description = "평상(PYEONGSANG)의 예약 확정(CONFIRMED) 건수. 없으면 0", example = "1")
    private final int pyeongsangConfirmedCount;

    public AdminReservationCalendarDayResponse(
            LocalDate date,
            FacilityCounts room,
            FacilityCounts pyeongsang,
            Integer reservationCount,
            Integer reservedQuantity,
            Integer pendingCount,
            Integer confirmedCount,
            Integer cancelRequestedCount
    ) {
        this.date = date;
        this.room = room;
        this.pyeongsang = pyeongsang;
        this.roomPendingCount = room.getPending();
        this.roomConfirmedCount = room.getConfirmed();
        this.pyeongsangPendingCount = pyeongsang.getPending();
        this.pyeongsangConfirmedCount = pyeongsang.getConfirmed();
        this.reservationCount = reservationCount;
        this.reservedQuantity = reservedQuantity;
        this.pendingCount = pendingCount;
        this.confirmedCount = confirmedCount;
        this.cancelRequestedCount = cancelRequestedCount;
    }

    @Getter
    @AllArgsConstructor
    @Schema(description = "시설 타입별 월간 요약")
    public static class FacilityCounts {
        @Schema(description = "입금 확인 대기(PENDING) 예약 건수", example = "2")
        private int pending;

        @Schema(description = "예약 확정(CONFIRMED) 예약 건수", example = "1")
        private int confirmed;
    }


    @Schema(
            description = "예약 건수",
            example = "4"
    )
    private Integer reservationCount;

    @Schema(
            description = "예약된 총 수량",
            example = "7"
    )
    private Integer reservedQuantity;

    @Schema(example = "1")
    private Integer pendingCount;

    @Schema(example = "2")
    private Integer confirmedCount;

    @Schema(example = "1")
    private Integer cancelRequestedCount;
}
