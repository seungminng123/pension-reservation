package com.pension.backend.reservation.service;

import com.pension.backend.reservation.dto.*;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.repository.ReservationRepository;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    @Value("${reservation.deposit-amount}")
    private Long depositAmount;

    @Transactional
    public ReservationResponse createReservation(
            ReservationCreateRequest request
    ) {
        validateDates(request.getCheckIn(), request.getCheckOut());

        Room room = roomRepository.findByIdForUpdate(request.getRoomId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "객실을 찾을 수 없습니다."
                        )
                );

        if (request.getGuestCount() > room.getMaxGuests()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "최대 수용 인원을 초과했습니다."
            );
        }

        boolean overlap =
                reservationRepository.existsOverlappingReservation(
                        room.getRoomId(),
                        request.getCheckIn(),
                        request.getCheckOut(),
                        ReservationStatus.CANCELED
                );

        if (overlap) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 예약된 기간입니다."
            );
        }

        long nights = ChronoUnit.DAYS.between(
                request.getCheckIn(),
                request.getCheckOut()
        );

        long totalPrice = room.getPrice() * nights;

        Reservation reservation = new Reservation(
                generateReservationNumber(),
                room,
                request.getGuestName(),
                request.getPhoneNumber(),
                request.getDepositorName(),
                request.getGuestCount(),
                request.getCheckIn(),
                request.getCheckOut(),
                totalPrice,
                depositAmount
        );

        return new ReservationResponse(
                reservationRepository.save(reservation)
        );
    }

    @Transactional(readOnly = true)
    public ReservationResponse lookupReservation(
            ReservationLookupRequest request
    ) {
        Reservation reservation =
                reservationRepository
                        .findByReservationNumberAndPhoneNumber(
                                request.getReservationNumber(),
                                request.getPhoneNumber()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "예약 정보를 찾을 수 없습니다."
                                )
                        );

        return new ReservationResponse(reservation);
    }

    @Transactional
    public ReservationStatusResponse requestCancel(
            String reservationNumber,
            ReservationCancelRequest request
    ) {
        Reservation reservation =
                reservationRepository
                        .findByReservationNumberAndPhoneNumber(
                                reservationNumber,
                                request.getPhoneNumber()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "예약 정보를 찾을 수 없습니다."
                                )
                        );

        try {
            reservation.requestCancel();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    e.getMessage()
            );
        }

        return new ReservationStatusResponse(reservation);
    }

    @Transactional(readOnly = true)
    public List<AdminReservationListResponse> getAdminReservations(
            ReservationStatus status
    ) {
        List<Reservation> reservations;

        if (status == null) {
            reservations = reservationRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
        } else {
            reservations =
                    reservationRepository
                            .findAllByStatusOrderByCreatedAtDesc(status);
        }

        return reservations.stream()
                .map(AdminReservationListResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminReservationDetailResponse getAdminReservation(
            Long reservationId
    ) {
        return new AdminReservationDetailResponse(
                findReservation(reservationId)
        );
    }

    @Transactional
    public ReservationStatusResponse confirmReservation(
            Long reservationId
    ) {
        Reservation reservation = findReservation(reservationId);

        try {
            reservation.confirm();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    e.getMessage()
            );
        }

        return new ReservationStatusResponse(reservation);
    }

    @Transactional
    public ReservationStatusResponse cancelReservation(
            Long reservationId
    ) {
        Reservation reservation = findReservation(reservationId);

        reservation.cancel();

        return new ReservationStatusResponse(reservation);
    }

    private Reservation findReservation(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "예약을 찾을 수 없습니다."
                        )
                );
    }

    private void validateDates(
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        if (!checkIn.isBefore(checkOut)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "체크아웃 날짜는 체크인보다 이후여야 합니다."
            );
        }

        if (checkIn.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "과거 날짜는 예약할 수 없습니다."
            );
        }
    }

    private String generateReservationNumber() {
        String time = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        );

        String random = UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();

        return "R" + time + random;
    }
}