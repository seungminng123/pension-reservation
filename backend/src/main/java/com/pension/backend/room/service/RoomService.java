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
import com.pension.backend.room.dto.RoomImageResponse;
import com.pension.backend.room.dto.RoomListResponse;
import com.pension.backend.room.dto.RoomUpdateRequest;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private static final long MAX_IMAGE_SIZE =
            10 * 1024 * 1024;

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final RoomDailyPriceService roomDailyPriceService;

    // 객실 목록 조회
    public List<RoomListResponse> getRooms() {
        return roomRepository
                .findAll()
                .stream()
                .map(RoomListResponse::new)
                .toList();
    }

    // 객실 상세 조회
    public RoomDetailResponse getRoom(
            Long roomId
    ) {
        Room room = findRoom(roomId);

        return new RoomDetailResponse(room);
    }

    // 객실 이미지 조회
    public RoomImageResponse getRoomImage(
            Long roomId
    ) {
        Room room = findRoom(roomId);

        if (
                room.getImageData() == null ||
                        room.getImageContentType() == null
        ) {
            throw new IllegalArgumentException(
                    "등록된 객실 이미지가 없습니다."
            );
        }

        return new RoomImageResponse(
                room.getImageData(),
                room.getImageContentType()
        );
    }

    // 월별 예약 정보 조회
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

        LocalDate monthEndExclusive =
                yearMonth
                        .plusMonths(1)
                        .atDay(1);

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

            while (current.isBefore(endDate)) {
                unavailableDates.add(current);

                current =
                        current.plusDays(1);
            }
        }

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

    // 예약 가능 여부 확인
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

        if (hasOverlap) {
            return new RoomAvailabilityCheckResponse(
                    false,
                    null
            );
        }

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

    // 객실 등록
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
                request.getGuestCount()
        );

        Room savedRoom =
                roomRepository.save(room);

        return new RoomDetailResponse(
                savedRoom
        );
    }

    // 객실 수정
    @Transactional
    public RoomDetailResponse updateRoom(
            Long roomId,
            RoomUpdateRequest request
    ) {
        Room room =
                findRoom(roomId);

        room.update(
                request.getType(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getMaxGuests(),
                request.getGuestCount()
        );

        return new RoomDetailResponse(room);
    }

    // 객실 이미지 저장
    @Transactional
    public void uploadRoomImage(
            Long roomId,
            MultipartFile file
    ) {
        Room room =
                findRoom(roomId);

        if (
                file == null ||
                        file.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "이미지 파일을 선택해 주세요."
            );
        }

        if (
                file.getSize() >
                        MAX_IMAGE_SIZE
        ) {
            throw new IllegalArgumentException(
                    "이미지는 10MB 이하만 업로드할 수 있습니다."
            );
        }

        String contentType =
                file.getContentType();

        if (
                contentType == null ||
                        !contentType.startsWith("image/")
        ) {
            throw new IllegalArgumentException(
                    "이미지 파일만 업로드할 수 있습니다."
            );
        }

        try {
            room.updateImage(
                    file.getBytes(),
                    contentType
            );
        } catch (IOException e) {
            throw new IllegalStateException(
                    "이미지 저장에 실패했습니다."
            );
        }
    }

    // 객실 조회
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

    // 예약 날짜 검증
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

        if (!checkOut.isAfter(checkIn)) {
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