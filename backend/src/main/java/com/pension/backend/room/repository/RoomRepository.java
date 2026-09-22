package com.pension.backend.room.repository;

import com.pension.backend.room.entity.Room;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository
        extends JpaRepository<Room, Long> {

    // 사용자 객실 목록
    List<Room>
    findAllByActiveTrueAndSaleEnabledTrueOrderByRoomIdAsc();

    // 관리자 객실 목록
    List<Room>
    findAllByActiveTrueOrderByRoomIdAsc();

    Optional<Room>
    findByRoomIdAndActiveTrue(
            Long roomId
    );

    // 예약 생성 시 객실 잠금
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r
            FROM Room r
            WHERE r.roomId = :roomId
              AND r.active = true
            """)
    Optional<Room> findByIdForUpdate(
            @Param("roomId")
            Long roomId
    );
}