package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.Reservation;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Schema(
        description = "관리자 예약 검색 페이지 응답"
)
public class AdminReservationPageResponse {

    @Schema(
            description = "현재 페이지 예약 목록"
    )
    private final List<AdminReservationListResponse> items;

    @Schema(
            description = "현재 페이지 번호. 0부터 시작",
            example = "0"
    )
    private final int page;

    @Schema(
            description = "페이지당 조회 개수",
            example = "20"
    )
    private final int size;

    @Schema(
            description = "전체 예약 수",
            example = "73"
    )
    private final long totalElements;

    @Schema(
            description = "전체 페이지 수",
            example = "4"
    )
    private final int totalPages;

    @Schema(
            description = "첫 페이지 여부",
            example = "true"
    )
    private final boolean first;

    @Schema(
            description = "마지막 페이지 여부",
            example = "false"
    )
    private final boolean last;

    public AdminReservationPageResponse(
            Page<Reservation> reservations
    ) {
        this.items =
                reservations
                        .getContent()
                        .stream()
                        .map(
                                AdminReservationListResponse::new
                        )
                        .toList();

        this.page =
                reservations.getNumber();

        this.size =
                reservations.getSize();

        this.totalElements =
                reservations.getTotalElements();

        this.totalPages =
                reservations.getTotalPages();

        this.first =
                reservations.isFirst();

        this.last =
                reservations.isLast();
    }
}