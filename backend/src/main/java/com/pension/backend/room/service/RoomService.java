package com.pension.backend.room.service;

import com.pension.backend.price.dto.RoomMonthlyPriceResponse;
import com.pension.backend.price.service.RoomDailyPriceService;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.repository.ReservationRepository;
import com.pension.backend.room.dto.*;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.entity.RoomImage;
import com.pension.backend.room.repository.RoomImageRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private static final long MAX_IMAGE_SIZE =
            10 * 1024 * 1024;

    private static final int MAX_IMAGE_COUNT =
            10;

    private final RoomRepository
            roomRepository;

    private final ReservationRepository
            reservationRepository;

    private final RoomDailyPriceService
            roomDailyPriceService;

    private final RoomImageRepository
            roomImageRepository;

    // 사용자 객실 목록
    public List<RoomListResponse> getRooms() {
        return roomRepository
                .findAllByActiveTrueAndSaleEnabledTrueOrderByRoomIdAsc()
                .stream()
                .map(
                        room ->
                                new RoomListResponse(
                                        room,
                                        hasImage(room)
                                )
                )
                .toList();
    }

    // 관리자 객실 목록
    public List<RoomListResponse>
    getAdminRooms() {
        return roomRepository
                .findAllByActiveTrueOrderByRoomIdAsc()
                .stream()
                .map(
                        room ->
                                new RoomListResponse(
                                        room,
                                        hasImage(room)
                                )
                )
                .toList();
    }

    // 객실 상세
    public RoomDetailResponse getRoom(
            Long roomId
    ) {
        Room room =
                findRoom(roomId);

        return new RoomDetailResponse(
                room,
                hasImage(room)
        );
    }

    // 월별 예약 정보
    public RoomAvailabilityResponse
    getAvailability(
            Long roomId,
            int year,
            int month
    ) {
        Room room =
                findRoom(roomId);

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
                        .findOverlappingReservations(
                                roomId,
                                monthStart,
                                monthEndExclusive,
                                ReservationStatus.CANCELED
                        );

        List<RoomDailyStockResponse>
                dailyStocks =
                new ArrayList<>();

        List<LocalDate>
                unavailableDates =
                new ArrayList<>();

        LocalDate current =
                monthStart;

        while (
                current.isBefore(
                        monthEndExclusive
                )
        ) {
            int reservedCount =
                    getReservedCount(
                            reservations,
                            current
                    );

            int remaining =
                    room.isSaleEnabled()
                            ? Math.max(
                            0,
                            room.getStockCount() -
                                    reservedCount
                    )
                            : 0;

            boolean soldOut =
                    remaining == 0;

            dailyStocks.add(
                    new RoomDailyStockResponse(
                            current,
                            remaining,
                            soldOut
                    )
            );

            if (soldOut) {
                unavailableDates.add(
                        current
                );
            }

            current =
                    current.plusDays(1);
        }

        RoomMonthlyPriceResponse
                monthlyPrices =
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
                unavailableDates,
                monthlyPrices.getPrices(),
                dailyStocks
        );
    }

    // 예약 가능 여부 확인
    public RoomAvailabilityCheckResponse
    checkAvailability(
            Long roomId,
            LocalDate checkIn,
            LocalDate checkOut,
            int quantity
    ) {
        validateDate(
                checkIn,
                checkOut
        );

        if (quantity < 1) {
            throw new IllegalArgumentException(
                    "예약 수량은 1개 이상이어야 합니다."
            );
        }

        Room room =
                findRoom(roomId);

        if (
                !room.isSaleEnabled()
        ) {
            return new RoomAvailabilityCheckResponse(
                    false,
                    null,
                    0
            );
        }

        List<Reservation> reservations =
                reservationRepository
                        .findOverlappingReservations(
                                roomId,
                                checkIn,
                                checkOut,
                                ReservationStatus.CANCELED
                        );

        int minimumRemaining =
                calculateMinimumRemaining(
                        room,
                        reservations,
                        checkIn,
                        checkOut
                );

        if (
                minimumRemaining <
                        quantity
        ) {
            return new RoomAvailabilityCheckResponse(
                    false,
                    null,
                    minimumRemaining
            );
        }

        long oneUnitPrice =
                roomDailyPriceService
                        .calculateTotalPrice(
                                room,
                                checkIn,
                                checkOut
                        );

        long totalPrice =
                Math.multiplyExact(
                        oneUnitPrice,
                        quantity
                );

        return new RoomAvailabilityCheckResponse(
                true,
                totalPrice,
                minimumRemaining
        );
    }

    // 객실 등록
    @Transactional
    public RoomDetailResponse createRoom(
            RoomCreateRequest request
    ) {
        int stockCount =
                request.getStockCount() == null
                        ? 1
                        : request.getStockCount();

        boolean saleEnabled =
                request.getSaleEnabled() == null ||
                        request.getSaleEnabled();

        Room room =
                new Room(
                        request.getType(),
                        request.getName(),
                        request.getDescription(),
                        request.getPrice(),
                        request.getMaxGuests(),
                        request.getGuestCount(),
                        stockCount,
                        saleEnabled
                );

        Room savedRoom =
                roomRepository.save(
                        room
                );

        return new RoomDetailResponse(
                savedRoom,
                false
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

        if (
                request.getStockCount() != null
        ) {
            validateStockChange(
                    room,
                    request.getStockCount()
            );
        }

        room.update(
                request.getType(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getMaxGuests(),
                request.getGuestCount(),
                request.getStockCount(),
                request.getSaleEnabled()
        );

        return new RoomDetailResponse(
                room,
                hasImage(room)
        );
    }

    // 객실 삭제
    @Transactional
    public void deleteRoom(
            Long roomId
    ) {
        Room room =
                findRoom(roomId);

        room.deactivate();
    }

    // 이미지 여러 장 업로드
    @Transactional
    public List<RoomImageMetaResponse>
    uploadRoomImages(
            Long roomId,
            List<MultipartFile> files
    ) {
        Room room =
                findRoom(roomId);

        if (
                files == null ||
                        files.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "이미지를 선택해 주세요."
            );
        }

        long currentCount =
                roomImageRepository
                        .countByRoomRoomId(
                                roomId
                        );

        if (
                currentCount +
                        files.size() >
                        MAX_IMAGE_COUNT
        ) {
            throw new IllegalArgumentException(
                    "객실 이미지는 최대 10장까지 등록할 수 있습니다."
            );
        }

        List<RoomImage> existing =
                roomImageRepository
                        .findAllByRoomRoomIdOrderByDisplayOrderAscRoomImageIdAsc(
                                roomId
                        );

        int nextOrder =
                existing.isEmpty()
                        ? 0
                        : existing
                        .get(
                                existing.size() - 1
                        )
                        .getDisplayOrder()
                        + 1;

        List<RoomImageMetaResponse>
                result =
                new ArrayList<>();

        for (
                MultipartFile file :
                files
        ) {
            validateImage(
                    file
            );

            try {
                RoomImage roomImage =
                        new RoomImage(
                                room,
                                file.getBytes(),
                                file.getContentType(),
                                nextOrder++
                        );

                RoomImage saved =
                        roomImageRepository.save(
                                roomImage
                        );

                result.add(
                        new RoomImageMetaResponse(
                                saved
                        )
                );

            } catch (
                    IOException e
            ) {
                throw new IllegalStateException(
                        "이미지 저장에 실패했습니다."
                );
            }
        }

        return result;
    }

    // 단일 이미지 업로드 호환용
    @Transactional
    public void uploadRoomImage(
            Long roomId,
            MultipartFile file
    ) {
        uploadRoomImages(
                roomId,
                List.of(file)
        );
    }

    // 이미지 목록
    public List<RoomImageMetaResponse>
    getRoomImages(
            Long roomId
    ) {
        findRoom(roomId);

        return roomImageRepository
                .findAllByRoomRoomIdOrderByDisplayOrderAscRoomImageIdAsc(
                        roomId
                )
                .stream()
                .map(
                        RoomImageMetaResponse::new
                )
                .toList();
    }

    // 대표 이미지
    public RoomImageResponse
    getRoomImage(
            Long roomId
    ) {
        findRoom(roomId);

        RoomImage roomImage =
                roomImageRepository
                        .findFirstByRoomRoomIdOrderByDisplayOrderAscRoomImageIdAsc(
                                roomId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "등록된 객실 이미지가 없습니다."
                                        )
                        );

        return toImageResponse(
                roomImage
        );
    }

    // 이미지 단건
    public RoomImageResponse
    getRoomImage(
            Long roomId,
            Long imageId
    ) {
        findRoom(roomId);

        RoomImage roomImage =
                findRoomImage(
                        roomId,
                        imageId
                );

        return toImageResponse(
                roomImage
        );
    }

    // 이미지 삭제
    @Transactional
    public void deleteRoomImage(
            Long roomId,
            Long imageId
    ) {
        findRoom(roomId);

        RoomImage roomImage =
                findRoomImage(
                        roomId,
                        imageId
                );

        roomImageRepository.delete(
                roomImage
        );

        normalizeImageOrder(
                roomId
        );
    }

    // 이미지 순서 변경
    @Transactional
    public List<RoomImageMetaResponse>
    updateImageOrder(
            Long roomId,
            RoomImageOrderRequest request
    ) {
        findRoom(roomId);

        List<RoomImage> images =
                roomImageRepository
                        .findAllByRoomRoomIdOrderByDisplayOrderAscRoomImageIdAsc(
                                roomId
                        );

        List<Long> requestedIds =
                request.getImageIds();

        if (
                images.size() !=
                        requestedIds.size()
        ) {
            throw new IllegalArgumentException(
                    "모든 이미지 ID를 순서대로 전달해 주세요."
            );
        }

        Map<Long, RoomImage>
                imageMap =
                new HashMap<>();

        for (
                RoomImage image :
                images
        ) {
            imageMap.put(
                    image.getRoomImageId(),
                    image
            );
        }

        for (
                int i = 0;
                i < requestedIds.size();
                i++
        ) {
            RoomImage image =
                    imageMap.get(
                            requestedIds.get(i)
                    );

            if (image == null) {
                throw new IllegalArgumentException(
                        "해당 객실에 속하지 않는 이미지가 포함되어 있습니다."
                );
            }

            image.updateDisplayOrder(
                    i
            );
        }

        return requestedIds
                .stream()
                .map(imageMap::get)
                .map(
                        RoomImageMetaResponse::new
                )
                .toList();
    }

    // 날짜 예약 수량 계산
    private int getReservedCount(
            List<Reservation> reservations,
            LocalDate date
    ) {
        int reservedCount = 0;

        for (
                Reservation reservation :
                reservations
        ) {
            boolean occupied =
                    !date.isBefore(
                            reservation.getCheckIn()
                    ) &&
                            date.isBefore(
                                    reservation.getCheckOut()
                            );

            if (occupied) {
                reservedCount +=
                        reservation.getQuantity() == null
                                ? 1
                                : reservation.getQuantity();
            }
        }

        return reservedCount;
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
                    getReservedCount(
                            reservations,
                            current
                    );

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

    // 재고 감소 검증
    private void validateStockChange(
            Room room,
            int newStockCount
    ) {
        List<Reservation> reservations =
                reservationRepository
                        .findAllByRoomRoomIdAndStatusNot(
                                room.getRoomId(),
                                ReservationStatus.CANCELED
                        );

        Map<LocalDate, Integer>
                reservedByDate =
                new HashMap<>();

        LocalDate today =
                LocalDate.now();

        for (
                Reservation reservation :
                reservations
        ) {
            LocalDate current =
                    reservation
                            .getCheckIn()
                            .isBefore(today)
                            ? today
                            : reservation.getCheckIn();

            while (
                    current.isBefore(
                            reservation.getCheckOut()
                    )
            ) {
                int quantity =
                        reservation.getQuantity() == null
                                ? 1
                                : reservation.getQuantity();

                reservedByDate.merge(
                        current,
                        quantity,
                        Integer::sum
                );

                current =
                        current.plusDays(1);
            }
        }

        int maximumReserved =
                reservedByDate
                        .values()
                        .stream()
                        .mapToInt(
                                Integer::intValue
                        )
                        .max()
                        .orElse(0);

        if (
                newStockCount <
                        maximumReserved
        ) {
            throw new IllegalArgumentException(
                    "현재 예약된 수량보다 재고를 적게 설정할 수 없습니다."
            );
        }
    }

    // 이미지 검증
    private void validateImage(
            MultipartFile file
    ) {
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
                    "이미지는 한 장당 10MB 이하만 업로드할 수 있습니다."
            );
        }

        String contentType =
                file.getContentType();

        if (
                contentType == null ||
                        !contentType.startsWith(
                                "image/"
                        )
        ) {
            throw new IllegalArgumentException(
                    "이미지 파일만 업로드할 수 있습니다."
            );
        }
    }

    // 이미지 순서 정리
    private void normalizeImageOrder(
            Long roomId
    ) {
        List<RoomImage> images =
                roomImageRepository
                        .findAllByRoomRoomIdOrderByDisplayOrderAscRoomImageIdAsc(
                                roomId
                        );

        for (
                int i = 0;
                i < images.size();
                i++
        ) {
            images
                    .get(i)
                    .updateDisplayOrder(i);
        }
    }

    private boolean hasImage(
            Room room
    ) {
        return roomImageRepository
                .existsByRoomRoomId(
                        room.getRoomId()
                );
    }

    private RoomImage findRoomImage(
            Long roomId,
            Long imageId
    ) {
        return roomImageRepository
                .findByRoomImageIdAndRoomRoomId(
                        imageId,
                        roomId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "객실 이미지를 찾을 수 없습니다."
                                )
                );
    }

    private RoomImageResponse toImageResponse(
            RoomImage roomImage
    ) {
        return new RoomImageResponse(
                roomImage.getImageData(),
                roomImage.getContentType()
        );
    }

    // 객실 조회
    private Room findRoom(
            Long roomId
    ) {
        return roomRepository
                .findByRoomIdAndActiveTrue(
                        roomId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "객실을 찾을 수 없습니다."
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
}