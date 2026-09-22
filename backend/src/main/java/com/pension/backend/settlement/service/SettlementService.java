package com.pension.backend.settlement.service;

import com.pension.backend.reservation.entity.PaymentMethod;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.repository.ReservationRepository;
import com.pension.backend.settlement.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettlementService {

    private final ReservationRepository
            reservationRepository;

    // 일일 정산
    public DailySettlementResponse
    getDailySettlement(
            LocalDate date
    ) {
        if (date == null) {
            throw new IllegalArgumentException(
                    "정산 날짜를 입력해 주세요."
            );
        }

        LocalDateTime start =
                date.atStartOfDay();

        LocalDateTime end =
                date
                        .plusDays(1)
                        .atStartOfDay();

        List<Reservation> reservations =
                getConfirmedReservations(
                        start,
                        end
                );

        long totalSales =
                getTotalSales(
                        reservations
                );

        long cardSales =
                getSalesByPaymentMethod(
                        reservations,
                        PaymentMethod.CARD
                );

        long cashSales =
                getSalesByPaymentMethod(
                        reservations,
                        PaymentMethod.CASH
                );

        int totalQuantity =
                getTotalQuantity(
                        reservations
                );

        List<SettlementItemResponse>
                items =
                reservations
                        .stream()
                        .map(
                                SettlementItemResponse::new
                        )
                        .toList();

        return new DailySettlementResponse(
                date,
                totalSales,
                cardSales,
                cashSales,
                reservations.size(),
                totalQuantity,
                items
        );
    }

    // 월별 정산
    public MonthlySettlementResponse
    getMonthlySettlement(
            int year,
            int month
    ) {
        YearMonth yearMonth;

        try {
            yearMonth =
                    YearMonth.of(
                            year,
                            month
                    );
        } catch (
                DateTimeException e
        ) {
            throw new IllegalArgumentException(
                    "올바른 연도와 월을 입력해 주세요."
            );
        }

        LocalDate monthStart =
                yearMonth.atDay(1);

        LocalDate monthEndExclusive =
                yearMonth
                        .plusMonths(1)
                        .atDay(1);

        List<Reservation> reservations =
                getConfirmedReservations(
                        monthStart.atStartOfDay(),
                        monthEndExclusive.atStartOfDay()
                );

        long totalSales =
                getTotalSales(
                        reservations
                );

        long cardSales =
                getSalesByPaymentMethod(
                        reservations,
                        PaymentMethod.CARD
                );

        long cashSales =
                getSalesByPaymentMethod(
                        reservations,
                        PaymentMethod.CASH
                );

        int totalQuantity =
                getTotalQuantity(
                        reservations
                );

        List<MonthlySettlementDayResponse>
                dailySettlements =
                new ArrayList<>();

        LocalDate current =
                monthStart;

        while (
                current.isBefore(
                        monthEndExclusive
                )
        ) {
            LocalDate date =
                    current;

            List<Reservation> dayReservations =
                    reservations
                            .stream()
                            .filter(
                                    reservation ->
                                            reservation
                                                    .getConfirmedAt()
                                                    .toLocalDate()
                                                    .equals(date)
                            )
                            .toList();

            dailySettlements.add(
                    new MonthlySettlementDayResponse(
                            date,
                            getTotalSales(
                                    dayReservations
                            ),
                            getSalesByPaymentMethod(
                                    dayReservations,
                                    PaymentMethod.CARD
                            ),
                            getSalesByPaymentMethod(
                                    dayReservations,
                                    PaymentMethod.CASH
                            ),
                            dayReservations.size(),
                            getTotalQuantity(
                                    dayReservations
                            )
                    )
            );

            current =
                    current.plusDays(1);
        }

        return new MonthlySettlementResponse(
                year,
                month,
                totalSales,
                cardSales,
                cashSales,
                reservations.size(),
                totalQuantity,
                dailySettlements
        );
    }

    private List<Reservation>
    getConfirmedReservations(
            LocalDateTime start,
            LocalDateTime end
    ) {
        return reservationRepository
                .findAllByStatusAndConfirmedAtGreaterThanEqualAndConfirmedAtLessThanOrderByConfirmedAtAsc(
                        ReservationStatus.CONFIRMED,
                        start,
                        end
                );
    }

    private long getTotalSales(
            List<Reservation> reservations
    ) {
        return reservations
                .stream()
                .mapToLong(
                        Reservation::getTotalPrice
                )
                .sum();
    }

    private long getSalesByPaymentMethod(
            List<Reservation> reservations,
            PaymentMethod paymentMethod
    ) {
        return reservations
                .stream()
                .filter(
                        reservation ->
                                reservation.getPaymentMethod()
                                        == paymentMethod
                )
                .mapToLong(
                        Reservation::getTotalPrice
                )
                .sum();
    }

    private int getTotalQuantity(
            List<Reservation> reservations
    ) {
        return reservations
                .stream()
                .mapToInt(
                        reservation ->
                                reservation.getQuantity() == null
                                        ? 1
                                        : reservation.getQuantity()
                )
                .sum();
    }
}