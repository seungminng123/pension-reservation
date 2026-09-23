package com.pension.backend.reservation.repository;

import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    // 특정 상품의 기간 겹침 예약
    @Query("""
            SELECT r
            FROM Reservation r
            WHERE r.room.roomId = :roomId
              AND r.status <> :canceledStatus
              AND r.checkIn < :endDate
              AND r.checkOut > :startDate
            """)
    List<Reservation>
    findOverlappingReservations(
            @Param("roomId")
            Long roomId,

            @Param("startDate")
            LocalDate startDate,

            @Param("endDate")
            LocalDate endDate,

            @Param("canceledStatus")
            ReservationStatus canceledStatus
    );

    // 전체 상품의 기간 겹침 예약
    @Query("""
            SELECT r
            FROM Reservation r
            WHERE r.status <> :canceledStatus
              AND r.checkIn < :endDate
              AND r.checkOut > :startDate
            """)
    List<Reservation>
    findAllOverlappingReservations(
            @Param("startDate")
            LocalDate startDate,

            @Param("endDate")
            LocalDate endDate,

            @Param("canceledStatus")
            ReservationStatus canceledStatus
    );

    Optional<Reservation>
    findByReservationNumberAndPhoneNumber(
            String reservationNumber,
            String phoneNumber
    );

    List<Reservation>
    findAllByStatusOrderByCreatedAtDesc(
            ReservationStatus status
    );

    List<Reservation>
    findAllByRoomRoomIdAndStatusNot(
            Long roomId,
            ReservationStatus status
    );

    // 정산 조회
    List<Reservation>
    findAllByStatusAndConfirmedAtGreaterThanEqualAndConfirmedAtLessThanOrderByConfirmedAtAsc(
            ReservationStatus status,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );
    // 관리자 예약 검색 + 필터 + 페이지네이션
    @Query(
            value = """
                SELECT r
                FROM Reservation r
                JOIN FETCH r.room room
                WHERE
                    (:status IS NULL OR r.status = :status)
                    AND (
                        :date IS NULL
                        OR (
                            r.checkIn <= :date
                            AND r.checkOut > :date
                        )
                    )
                    AND (
                        :keyword IS NULL
                        OR LOWER(r.guestName)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(r.reservationNumber)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR r.phoneNumber
                            LIKE CONCAT('%', :keyword, '%')
                        OR (
                            :phoneKeyword IS NOT NULL
                            AND REPLACE(
                                REPLACE(
                                    r.phoneNumber,
                                    '-',
                                    ''
                                ),
                                ' ',
                                ''
                            )
                            LIKE CONCAT(
                                '%',
                                :phoneKeyword,
                                '%'
                            )
                        )
                    )
                """,
            countQuery = """
                SELECT COUNT(r)
                FROM Reservation r
                WHERE
                    (:status IS NULL OR r.status = :status)
                    AND (
                        :date IS NULL
                        OR (
                            r.checkIn <= :date
                            AND r.checkOut > :date
                        )
                    )
                    AND (
                        :keyword IS NULL
                        OR LOWER(r.guestName)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(r.reservationNumber)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR r.phoneNumber
                            LIKE CONCAT('%', :keyword, '%')
                        OR (
                            :phoneKeyword IS NOT NULL
                            AND REPLACE(
                                REPLACE(
                                    r.phoneNumber,
                                    '-',
                                    ''
                                ),
                                ' ',
                                ''
                            )
                            LIKE CONCAT(
                                '%',
                                :phoneKeyword,
                                '%'
                            )
                        )
                    )
                """
    )
    Page<Reservation>
    searchAdminReservations(
            @Param("keyword")
            String keyword,

            @Param("phoneKeyword")
            String phoneKeyword,

            @Param("status")
            ReservationStatus status,

            @Param("date")
            LocalDate date,

            Pageable pageable
    );
}