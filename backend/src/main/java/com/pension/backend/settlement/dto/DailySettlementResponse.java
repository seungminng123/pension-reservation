package com.pension.backend.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class DailySettlementResponse {

    private LocalDate date;

    private Long totalSales;

    private Long cardSales;

    private Long cashSales;

    private Integer confirmedReservationCount;

    private Integer totalQuantity;

    private List<SettlementItemResponse> items;
}