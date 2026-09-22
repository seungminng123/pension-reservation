package com.pension.backend.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MonthlySettlementResponse {

    private Integer year;

    private Integer month;

    private Long totalSales;

    private Long cardSales;

    private Long cashSales;

    private Integer confirmedReservationCount;

    private Integer totalQuantity;

    private List<MonthlySettlementDayResponse>
            dailySettlements;
}