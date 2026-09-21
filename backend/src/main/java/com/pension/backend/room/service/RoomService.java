package com.pension.backend.room.service;

import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.repository.ReservationRepository;
import com.pension.backend.room.dto.*;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.TreeSet;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<RoomListResponse> getRooms() {
        return roomRepository.findAll()
                .stream()
                .map(RoomListResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomDetailResponse getRoom(Long roomId) {
        return new RoomDetailResponse(findRoom(roomId));
    }

    @Transactional(readOnly = true)
    public RoomAvailabilityResponse getAvailability(
            Long roomId,
            int year,
            int month
    ) {
        findRoom(roomId);

        YearMonth yearMonth;

        try {
            yearMonth = YearMonth.of(year, month);
        } catch (DateTimeException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "올바르지 않은 연도 또는 월입니다."
            );
        }

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.plusMonths(1).atDay(1);

        List<Reservation> reservations =
                reservationRepository.findOverlappingReservations(
                        roomId,
                        startDate,
                        endDate,
                        ReservationStatus.CANCELED
                );

        TreeSet<LocalDate> unavailableDates = new TreeSet<>();

        for (Reservation reservation : reservations) {

            LocalDate date =
                    reservation.getCheckIn().isBefore(startDate)
                            ? startDate
                            : reservation.getCheckIn();

            LocalDate reservationEnd =
                    reservation.getCheckOut().isAfter(endDate)
                            ? endDate
                            : reservation.getCheckOut();

            while (date.isBefore(reservationEnd)) {
                unavailableDates.add(date);
                date = date.plusDays(1);
            }
        }

        return new RoomAvailabilityResponse(
                roomId,
                year,
                month,
                unavailableDates.stream().toList()
        );
    }

    @Transactional(readOnly = true)
    public RoomAvailabilityCheckResponse checkAvailability(
            Long roomId,
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        findRoom(roomId);

        validateDate(checkIn, checkOut);

        boolean overlap =
                reservationRepository.existsOverlappingReservation(
                        roomId,
                        checkIn,
                        checkOut,
                        ReservationStatus.CANCELED
                );

        return new RoomAvailabilityCheckResponse(!overlap);
    }

    @Transactional
    public RoomDetailResponse createRoom(RoomCreateRequest request) {

        Room room = new Room(
                request.getType(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getMaxGuests(),
                request.getGuestCount(),
                request.getImageUrl()
        );

        return new RoomDetailResponse(
                roomRepository.save(room)
        );
    }

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

    private Room findRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "객실을 찾을 수 없습니다."
                        )
                );
    }

    private void validateDate(
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        if (!checkIn.isBefore(checkOut)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "체크아웃 날짜는 체크인보다 이후여야 합니다."
            );
        }
    }
}