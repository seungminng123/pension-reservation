package com.pension.backend.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
@Schema(description = "관리자 예약 메모 수정 요청")
public class AdminReservationMemoRequest {

    @Size(
            max = 500,
            message = "관리자 메모는 최대 500자까지 입력할 수 있습니다."
    )
    @Schema(
            description = "관리자 전용 예약 메모",
            example = "차량 2대, 늦은 체크인 예정"
    )
    private String memo;
}