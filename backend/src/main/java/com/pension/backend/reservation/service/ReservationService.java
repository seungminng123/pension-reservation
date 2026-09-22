package com.pension.backend.reservation.service;

import com.pension.backend.price.service.RoomDailyPriceService;
import com.pension.backend.reservation.dto.*;
import com.pension.backend.reservation.entity.PaymentMethod;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.repository.ReservationRepository;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository
            reservationRepository;

    private final RoomRepository
            roomRepository;

    private final RoomDailyPriceService
            roomDailyPriceService;

    @Value("${reservation.deposit-amount}")
    private Long depositAmount;

    // 예약 생성
    @Transactional
    public ReservationResponse createReservation(
            ReservationCreateRequest request
    ) {
        validateDate(
                request.getCheckIn(),
                request.getCheckOut()
        );

        Room room =
                roomRepository
                        .findByIdForUpdate(
                                request.getRoomId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "객실을 찾을 수 없습니다."
                                        )
                        );

        if (!room.isSaleEnabled()) {
            throw new IllegalStateException(
                    "현재 판매 중지된 상품입니다."
            );
        }

        if (
                request.getGuestCount() == null ||
                        request.getGuestCount() < 1
        ) {
            throw new IllegalArgumentException(
                    "예약 인원은 1명 이상이어야 합니다."
            );
        }

        if (
                request.getGuestCount() >
                        room.getMaxGuests()
        ) {
            throw new IllegalArgumentException(
                    "최대 예약 가능 인원을 초과했습니다."
            );
        }

        int quantity =
                request.getQuantity() == null
                        ? 1
                        : request.getQuantity();

        if (quantity < 1) {
            throw new IllegalArgumentException(
                    "예약 수량은 1개 이상이어야 합니다."
            );
        }

        if (
                quantity >
                        room.getStockCount()
        ) {
            throw new IllegalArgumentException(
                    "전체 재고 수량을 초과했습니다."
            );
        }

        List<Reservation> reservations =
                reservationRepository
                        .findOverlappingReservations(
                                room.getRoomId(),
                                request.getCheckIn(),
                                request.getCheckOut(),
                                ReservationStatus.CANCELED
                        );

        int minimumRemaining =
                calculateMinimumRemaining(
                        room,
                        reservations,
                        request.getCheckIn(),
                        request.getCheckOut()
                );

        if (
                minimumRemaining <
                        quantity
        ) {
            throw new IllegalStateException(
                    "선택한 기간의 잔여 수량이 부족합니다."
            );
        }

        long oneUnitPrice =
                roomDailyPriceService
                        .calculateTotalPrice(
                                room,
                                request.getCheckIn(),
                                request.getCheckOut()
                        );

        long totalPrice =
                Math.multiplyExact(
                        oneUnitPrice,
                        quantity
                );

        String reservationNumber =
                generateReservationNumber();

        Reservation reservation =
                new Reservation(
                        reservationNumber,
                        room,
                        request.getGuestName(),
                        request.getPhoneNumber(),
                        request.getDepositorName(),
                        request.getGuestCount(),
                        quantity,
                        request.getCheckIn(),
                        request.getCheckOut(),
                        totalPrice,
                        depositAmount
                );

        Reservation savedReservation =
                reservationRepository.save(
                        reservation
                );

        return new ReservationResponse(
                savedReservation
        );
    }

    // 사용자 예약 조회
    public ReservationResponse lookupReservation(
            String reservationNumber,
            String phoneNumber
    ) {
        Reservation reservation =
                reservationRepository
                        .findByReservationNumberAndPhoneNumber(
                                reservationNumber,
                                phoneNumber
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "예약 정보를 찾을 수 없습니다."
                                        )
                        );

        return new ReservationResponse(
                reservation
        );
    }

    // 사용자 취소 요청
    @Transactional
    public ReservationStatusResponse requestCancel(
            String reservationNumber,
            String phoneNumber
    ) {
        Reservation reservation =
                reservationRepository
                        .findByReservationNumberAndPhoneNumber(
                                reservationNumber,
                                phoneNumber
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "예약 정보를 찾을 수 없습니다."
                                        )
                        );

        reservation.requestCancel();

        return new ReservationStatusResponse(
                reservation
        );
    }

    // 관리자 예약 목록
    public List<AdminReservationListResponse>
    getAdminReservations(
            ReservationStatus status
    ) {
        List<Reservation> reservations;

        if (status == null) {

            reservations =
                    reservationRepository
                            .findAll();

        } else {

            reservations =
                    reservationRepository
                            .findAllByStatusOrderByCreatedAtDesc(
                                    status
                            );
        }

        return reservations
                .stream()
                .sorted(
                        Comparator.comparing(
                                        Reservation::getCreatedAt
                                )
                                .reversed()
                )
                .map(
                        AdminReservationListResponse::new
                )
                .toList();
    }

    // 관리자 예약 상세
    public AdminReservationDetailResponse
    getAdminReservation(
            Long reservationId
    ) {
        Reservation reservation =
                findReservation(
                        reservationId
                );

        return new AdminReservationDetailResponse(
                reservation
        );
    }

    // 관리자 메모 수정
    @Transactional
    public AdminReservationDetailResponse
    updateAdminMemo(
            Long reservationId,
            String memo
    ) {
        Reservation reservation =
                findReservation(
                        reservationId
                );

        String normalizedMemo =
                memo == null ||
                        memo.trim().isEmpty()
                        ? null
                        : memo.trim();

        reservation.updateAdminMemo(
                normalizedMemo
        );

        return new AdminReservationDetailResponse(
                reservation
        );
    }

    // 관리자 월별 예약 캘린더
    public List<AdminReservationCalendarDayResponse>
    getAdminReservationCalendar(
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
                reservationRepository
                        .findAllOverlappingReservations(
                                monthStart,
                                monthEndExclusive,
                                ReservationStatus.CANCELED
                        );

        Map<LocalDate, List<Reservation>>
                reservationsByDate =
                new HashMap<>();

        for (
                Reservation reservation :
                reservations
        ) {
            LocalDate startDate =
                    reservation
                            .getCheckIn()
                            .isBefore(monthStart)
                            ? monthStart
                            : reservation.getCheckIn();

            LocalDate endDate =
                    reservation
                            .getCheckOut()
                            .isAfter(monthEndExclusive)
                            ? monthEndExclusive
                            : reservation.getCheckOut();

            LocalDate current =
                    startDate;

            while (
                    current.isBefore(
                            endDate
                    )
            ) {
                reservationsByDate
                        .computeIfAbsent(
                                current,
                                key ->
                                        new ArrayList<>()
                        )
                        .add(
                                reservation
                        );

                current =
                        current.plusDays(1);
            }
        }

        List<AdminReservationCalendarDayResponse>
                result =
                new ArrayList<>();

        LocalDate current =
                monthStart;

        while (
                current.isBefore(
                        monthEndExclusive
                )
        ) {
            List<Reservation> dayReservations =
                    reservationsByDate
                            .getOrDefault(
                                    current,
                                    List.of()
                            );

            if (!dayReservations.isEmpty()) {

                int reservedQuantity =
                        dayReservations
                                .stream()
                                .mapToInt(
                                        reservation ->
                                                reservation.getQuantity() == null
                                                        ? 1
                                                        : reservation.getQuantity()
                                )
                                .sum();

                int pendingCount =
                        countStatus(
                                dayReservations,
                                ReservationStatus.PENDING
                        );

                int confirmedCount =
                        countStatus(
                                dayReservations,
                                ReservationStatus.CONFIRMED
                        );

                int cancelRequestedCount =
                        countStatus(
                                dayReservations,
                                ReservationStatus.CANCEL_REQUESTED
                        );

                result.add(
                        new AdminReservationCalendarDayResponse(
                                current,
                                dayReservations.size(),
                                reservedQuantity,
                                pendingCount,
                                confirmedCount,
                                cancelRequestedCount
                        )
                );
            }

            current =
                    current.plusDays(1);
        }

        return result;
    }

    // 관리자 특정 날짜 예약 조회
    public List<AdminReservationCalendarItemResponse>
    getAdminReservationsByDate(
            LocalDate date
    ) {
        if (date == null) {
            throw new IllegalArgumentException(
                    "날짜를 입력해 주세요."
            );
        }

        List<Reservation> reservations =
                reservationRepository
                        .findAllOverlappingReservations(
                                date,
                                date.plusDays(1),
                                ReservationStatus.CANCELED
                        );

        return reservations
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        (Reservation reservation) ->
                                                reservation
                                                        .getRoom()
                                                        .getType()
                                )
                                .thenComparing(
                                        reservation ->
                                                reservation
                                                        .getRoom()
                                                        .getName()
                                )
                )
                .map(
                        AdminReservationCalendarItemResponse::new
                )
                .toList();
    }

    // 관리자 예약 확정
    @Transactional
    public ReservationStatusResponse
    confirmReservation(
            Long reservationId,
            PaymentMethod paymentMethod
    ) {
        Reservation reservation =
                findReservation(
                        reservationId
                );

        reservation.confirm(
                paymentMethod
        );

        return new ReservationStatusResponse(
                reservation
        );
    }

    // 관리자 예약 취소
    @Transactional
    public ReservationStatusResponse
    cancelReservation(
            Long reservationId
    ) {
        Reservation reservation =
                findReservation(
                        reservationId
                );

        reservation.cancel();

        return new ReservationStatusResponse(
                reservation
        );
    }

    // 상태별 예약 건수
    private int countStatus(
            List<Reservation> reservations,
            ReservationStatus status
    ) {
        return (int)
                reservations
                        .stream()
                        .filter(
                                reservation ->
                                        reservation.getStatus()
                                                == status
                        )
                        .count();
    }

    // 기간 최소 잔여 수량
    private int calculateMinimumRemaining(
            Room room,
            List<Reservation> reservations,
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        int minimumRemaining =
                room.getStockCount();

        LocalDate current =
                checkIn;

        while (
                current.isBefore(
                        checkOut
                )
        ) {
            int reservedCount =
                    0;

            for (
                    Reservation reservation :
                    reservations
            ) {
                boolean occupied =
                        !current.isBefore(
                                reservation.getCheckIn()
                        ) &&
                                current.isBefore(
                                        reservation.getCheckOut()
                                );

                if (occupied) {
                    reservedCount +=
                            reservation.getQuantity() == null
                                    ? 1
                                    : reservation.getQuantity();
                }
            }

            int remaining =
                    Math.max(
                            0,
                            room.getStockCount() -
                                    reservedCount
                    );

            minimumRemaining =
                    Math.min(
                            minimumRemaining,
                            remaining
                    );

            current =
                    current.plusDays(1);
        }

        return minimumRemaining;
    }

    // 예약 조회
    private Reservation findReservation(
            Long reservationId
    ) {
        return reservationRepository
                .findById(
                        reservationId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "예약 정보를 찾을 수 없습니다."
                                )
                );
    }

    // 날짜 검증
    private void validateDate(
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        if (
                checkIn == null ||
                        checkOut == null
        ) {
            throw new IllegalArgumentException(
                    "체크인과 체크아웃 날짜를 입력해 주세요."
            );
        }

        if (
                !checkOut.isAfter(
                        checkIn
                )
        ) {
            throw new IllegalArgumentException(
                    "체크아웃 날짜는 체크인 날짜보다 이후여야 합니다."
            );
        }

        if (
                checkIn.isBefore(
                        LocalDate.now()
                )
        ) {
            throw new IllegalArgumentException(
                    "지난 날짜에는 예약할 수 없습니다."
            );
        }
    }

    // 예약번호 생성
    private String generateReservationNumber() {

        String timestamp =
                LocalDateTime
                        .now()
                        .format(
                                DateTimeFormatter
                                        .ofPattern(
                                                "yyyyMMddHHmmss"
                                        )
                        );

        String random =
                UUID.randomUUID()
                        .toString()
                        .replace(
                                "-",
                                ""
                        )
                        .substring(
                                0,
                                6
                        )
                        .toUpperCase();

        return "R"
                + timestamp
                + random;
    }
}