package com.pension.backend.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class MonthlySettlementDayResponse {

    private LocalDate date;

    private Long totalSales;

    private Long cardSales;

    private Long cashSales;

    private Integer reservationCount;

    private Integer totalQuantity;
}