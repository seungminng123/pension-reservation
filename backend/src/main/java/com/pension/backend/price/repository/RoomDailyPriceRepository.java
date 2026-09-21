package com.pension.backend.price.repository;

import com.pension.backend.price.entity.RoomDailyPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface RoomDailyPriceRepository
        extends JpaRepository<RoomDailyPrice, Long> {

    List<RoomDailyPrice>
    findAllByRoomRoomIdAndDateBetweenOrderByDateAsc(
            Long roomId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<RoomDailyPrice>
    findAllByRoomRoomIdAndDateIn(
            Long roomId,
            Collection<LocalDate> dates
    );

    void deleteAllByRoomRoomIdAndDateIn(
            Long roomId,
            Collection<LocalDate> dates
    );
}