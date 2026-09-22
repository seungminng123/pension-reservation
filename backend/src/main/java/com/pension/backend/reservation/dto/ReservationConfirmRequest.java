package com.pension.backend.reservation.dto;

import com.pension.backend.reservation.entity.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
@Schema(description = "관리자 예약 확정 요청")
public class ReservationConfirmRequest {

    @NotNull
    @Schema(
            description = "결제 수단",
            allowableValues = {
                    "CARD",
                    "CASH"
            },
            example = "CARD"
    )
    private PaymentMethod paymentMethod;
}