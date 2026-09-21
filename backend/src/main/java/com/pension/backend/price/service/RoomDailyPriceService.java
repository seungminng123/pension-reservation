package com.pension.backend.price.service;

import com.pension.backend.price.dto.*;
import com.pension.backend.price.entity.RoomDailyPrice;
import com.pension.backend.price.repository.RoomDailyPriceRepository;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomDailyPriceService {

    private final RoomDailyPriceRepository roomDailyPriceRepository;
    private final RoomRepository roomRepository;

    public RoomMonthlyPriceResponse getMonthlyPrices(
            Long roomId,
            int year,
            int month
    ) {
        Room room = findRoom(roomId);

        return getMonthlyPrices(room, year, month);
    }

    public RoomMonthlyPriceResponse getMonthlyPrices(
            Room room,
            int year,
            int month
    ) {
        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<RoomDailyPrice> customPrices =
                roomDailyPriceRepository
                        .findAllByRoomRoomIdAndDateBetweenOrderByDateAsc(
                                room.getRoomId(),
                                startDate,
                                endDate
                        );

        Map<LocalDate, RoomDailyPrice> customPriceMap =
                customPrices.stream()
                        .collect(
                                Collectors.toMap(
                                        RoomDailyPrice::getDate,
                                        Function.identity()
                                )
                        );

        List<RoomDailyPriceResponse> prices =
                new ArrayList<>();

        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {

            RoomDailyPrice customPrice =
                    customPriceMap.get(current);

            if (customPrice != null) {
                prices.add(
                        new RoomDailyPriceResponse(
                                current,
                                customPrice.getPrice(),
                                true
                        )
                );
            } else {
                prices.add(
                        new RoomDailyPriceResponse(
                                current,
                                room.getPrice(),
                                false
                        )
                );
            }

            current = current.plusDays(1);
        }

        return new RoomMonthlyPriceResponse(
                room.getRoomId(),
                year,
                month,
                room.getPrice(),
                prices
        );
    }

    @Transactional
    public RoomMonthlyPriceResponse setPrices(
            Long roomId,
            RoomDailyPriceSetRequest request
    ) {
        Room room = findRoom(roomId);

        Set<LocalDate> dates =
                new HashSet<>(request.getDates());

        List<RoomDailyPrice> existingPrices =
                roomDailyPriceRepository
                        .findAllByRoomRoomIdAndDateIn(
                                roomId,
                                dates
                        );

        Map<LocalDate, RoomDailyPrice> existingMap =
                existingPrices.stream()
                        .collect(
                                Collectors.toMap(
                                        RoomDailyPrice::getDate,
                                        Function.identity()
                                )
                        );

        List<RoomDailyPrice> pricesToSave =
                new ArrayList<>();

        for (LocalDate date : dates) {

            RoomDailyPrice existing =
                    existingMap.get(date);

            if (existing != null) {
                existing.updatePrice(
                        request.getPrice()
                );

                pricesToSave.add(existing);
            } else {
                pricesToSave.add(
                        new RoomDailyPrice(
                                room,
                                date,
                                request.getPrice()
                        )
                );
            }
        }

        roomDailyPriceRepository.saveAll(
                pricesToSave
        );

        LocalDate firstDate =
                dates.stream()
                        .min(LocalDate::compareTo)
                        .orElseThrow();

        return getMonthlyPrices(
                room,
                firstDate.getYear(),
                firstDate.getMonthValue()
        );
    }

    @Transactional
    public void resetPrices(
            Long roomId,
            RoomDailyPriceResetRequest request
    ) {
        findRoom(roomId);

        roomDailyPriceRepository
                .deleteAllByRoomRoomIdAndDateIn(
                        roomId,
                        new HashSet<>(
                                request.getDates()
                        )
                );
    }

    public long calculateTotalPrice(
            Room room,
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        LocalDate lastNight =
                checkOut.minusDays(1);

        List<RoomDailyPrice> customPrices =
                roomDailyPriceRepository
                        .findAllByRoomRoomIdAndDateBetweenOrderByDateAsc(
                                room.getRoomId(),
                                checkIn,
                                lastNight
                        );

        Map<LocalDate, Long> priceMap =
                customPrices.stream()
                        .collect(
                                Collectors.toMap(
                                        RoomDailyPrice::getDate,
                                        RoomDailyPrice::getPrice
                                )
                        );

        long totalPrice = 0L;

        LocalDate date = checkIn;

        while (date.isBefore(checkOut)) {

            totalPrice +=
                    priceMap.getOrDefault(
                            date,
                            room.getPrice()
                    );

            date = date.plusDays(1);
        }

        return totalPrice;
    }

    private Room findRoom(Long roomId) {
        return roomRepository
                .findById(roomId)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "객실을 찾을 수 없습니다."
                                )
                );
    }
}