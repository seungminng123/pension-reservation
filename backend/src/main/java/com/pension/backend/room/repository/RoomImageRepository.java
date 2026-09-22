package com.pension.backend.room.repository;

import com.pension.backend.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomImageRepository
        extends JpaRepository<RoomImage, Long> {

    List<RoomImage>
    findAllByRoomRoomIdOrderByDisplayOrderAscRoomImageIdAsc(
            Long roomId
    );

    Optional<RoomImage>
    findFirstByRoomRoomIdOrderByDisplayOrderAscRoomImageIdAsc(
            Long roomId
    );

    Optional<RoomImage>
    findByRoomImageIdAndRoomRoomId(
            Long roomImageId,
            Long roomId
    );

    boolean existsByRoomRoomId(
            Long roomId
    );

    long countByRoomRoomId(
            Long roomId
    );
}