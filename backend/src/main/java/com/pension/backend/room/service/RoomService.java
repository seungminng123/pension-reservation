package com.pension.backend.room.service;

import com.pension.backend.price.dto.RoomMonthlyPriceResponse;
import com.pension.backend.price.service.RoomDailyPriceService;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.repository.ReservationRepository;
import com.pension.backend.room.dto.RoomAvailabilityCheckResponse;
import com.pension.backend.room.dto.RoomAvailabilityResponse;
import com.pension.backend.room.dto.RoomCreateRequest;
import com.pension.backend.room.dto.RoomDetailResponse;
import com.pension.backend.room.dto.RoomListResponse;
import com.pension.backend.room.dto.RoomUpdateRequest;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    /*
     * 날짜별 가격 서비스
     */
    private final RoomDailyPriceService roomDailyPriceService;

    /**
     * 사용자 객실 목록 조회
     */
    public List<RoomListResponse> getRooms() {

        return roomRepository
                .findAll()
                .stream()
                .map(RoomListResponse::new)
                .toList();
    }

    /**
     * 객실 상세 조회
     */
    public RoomDetailResponse getRoom(
            Long roomId
    ) {

        Room room = findRoom(roomId);

        return new RoomDetailResponse(room);
    }

    /**
     * 특정 월의 예약 불가능 날짜 +
     * 날짜별 실제 가격 조회
     */
    public RoomAvailabilityResponse getAvailability(
            Long roomId,
            int year,
            int month
    ) {

        Room room = findRoom(roomId);

        YearMonth yearMonth;

        try {
            yearMonth = YearMonth.of(
                    year,
                    month
            );
        } catch (DateTimeException e) {
            throw new IllegalArgumentException(
                    "올바른 연도와 월을 입력해 주세요."
            );
        }

        LocalDate monthStart =
                yearMonth.atDay(1);

        /*
         * 다음 달 1일
         *
         * 예약 overlap 조회에서 endDate는
         * exclusive 개념으로 사용한다.
         */
        LocalDate monthEndExclusive =
                yearMonth
                        .plusMonths(1)
                        .atDay(1);

        /*
         * CANCELED 상태를 제외하고
         * 해당 월과 겹치는 모든 예약 조회
         */
        List<Reservation> reservations =
                reservationRepository
                        .findOverlappingReservations(
                                roomId,
                                monthStart,
                                monthEndExclusive,
                                ReservationStatus.CANCELED
                        );

        List<LocalDate> unavailableDates =
                new ArrayList<>();

        for (Reservation reservation : reservations) {

            /*
             * 조회 월보다 이전에 체크인했을 수도 있기 때문에
             * 월 시작일과 예약 체크인 중 늦은 날짜부터 시작
             */
            LocalDate startDate =
                    reservation
                            .getCheckIn()
                            .isBefore(monthStart)
                            ? monthStart
                            : reservation.getCheckIn();

            /*
             * 다음 달까지 이어지는 예약일 수도 있으므로
             * 예약 체크아웃과 다음 달 1일 중 빠른 날짜까지만 사용
             */
            LocalDate endDate =
                    reservation
                            .getCheckOut()
                            .isAfter(monthEndExclusive)
                            ? monthEndExclusive
                            : reservation.getCheckOut();

            LocalDate current = startDate;

            /*
             * 체크아웃 날짜는 점유하지 않음.
             *
             * 예:
             * 10/03 체크인
             * 10/05 체크아웃
             *
             * 예약 불가능:
             * 10/03
             * 10/04
             *
             * 10/05는 새로운 체크인 가능
             */
            while (current.isBefore(endDate)) {

                unavailableDates.add(current);

                current =
                        current.plusDays(1);
            }
        }

        /*
         * 해당 월의 실제 날짜별 판매 가격 조회
         */
        RoomMonthlyPriceResponse monthlyPrices =
                roomDailyPriceService
                        .getMonthlyPrices(
                                room,
                                year,
                                month
                        );

        return new RoomAvailabilityResponse(
                roomId,
                year,
                month,
                unavailableDates
                        .stream()
                        .distinct()
                        .sorted()
                        .toList(),
                monthlyPrices.getPrices()
        );
    }

    /**
     * 체크인 ~ 체크아웃 예약 가능 여부 확인
     *
     * 예약 가능하다면 날짜별 가격을 합산한
     * 실제 총 금액도 함께 반환한다.
     */
    public RoomAvailabilityCheckResponse checkAvailability(
            Long roomId,
            LocalDate checkIn,
            LocalDate checkOut
    ) {

        validateDate(
                checkIn,
                checkOut
        );

        Room room = findRoom(roomId);

        boolean hasOverlap =
                reservationRepository
                        .existsOverlappingReservation(
                                roomId,
                                checkIn,
                                checkOut,
                                ReservationStatus.CANCELED
                        );

        /*
         * 기존 예약과 겹치면
         * 가격 계산 없이 바로 반환
         */
        if (hasOverlap) {
            return new RoomAvailabilityCheckResponse(
                    false,
                    null
            );
        }

        /*
         * 날짜별 가격을 실제로 합산
         */
        long totalPrice =
                roomDailyPriceService
                        .calculateTotalPrice(
                                room,
                                checkIn,
                                checkOut
                        );

        return new RoomAvailabilityCheckResponse(
                true,
                totalPrice
        );
    }

    /**
     * 관리자 객실 등록
     */
    @Transactional
    public RoomDetailResponse createRoom(
            RoomCreateRequest request
    ) {

        Room room = new Room(
                request.getType(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getMaxGuests(),
                request.getGuestCount(),
                request.getImageUrl()
        );

        Room savedRoom =
                roomRepository.save(room);

        return new RoomDetailResponse(
                savedRoom
        );
    }

    /**
     * 관리자 객실 수정
     */
    @Transactional
    public RoomDetailResponse updateRoom(
            Long roomId,
            RoomUpdateRequest request
    ) {

        Room room = findRoom(roomId);

        room.update(
                request.getType(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getMaxGuests(),
                request.getGuestCount(),
                request.getImageUrl()
        );

        return new RoomDetailResponse(room);
    }

    /**
     * 객실 조회 공통 함수
     */
    private Room findRoom(
            Long roomId
    ) {

        return roomRepository
                .findById(roomId)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "객실을 찾을 수 없습니다."
                                )
                );
    }

    /**
     * 예약 날짜 검증
     */
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
                !checkOut.isAfter(checkIn)
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
}