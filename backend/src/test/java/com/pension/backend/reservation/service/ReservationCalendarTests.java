package com.pension.backend.reservation.service;

import com.pension.backend.price.service.RoomDailyPriceService;
import com.pension.backend.reservation.entity.Reservation;
import com.pension.backend.reservation.entity.ReservationStatus;
import com.pension.backend.reservation.repository.ReservationRepository;
import com.pension.backend.room.entity.Room;
import com.pension.backend.room.repository.RoomRepository;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReservationCalendarTests {
    private final ReservationRepository repository = mock(ReservationRepository.class);
    private final ReservationService service = new ReservationService(
            repository, mock(RoomRepository.class), mock(RoomDailyPriceService.class)
    );

    @Test
    void countsReservationsByFacilityAndStatusAcrossMonthBoundary() {
        var reservations = List.of(
                reservation("ROOM", ReservationStatus.CONFIRMED, "2026-08-31", "2026-09-03", 5),
                reservation("ROOM", ReservationStatus.PENDING, "2026-09-01", "2026-09-02", 2),
                reservation("PYEONGSANG", ReservationStatus.CONFIRMED, "2026-09-01", "2026-09-02", 3),
                reservation("PYEONGSANG", ReservationStatus.PENDING, "2026-09-01", "2026-09-02", 4),
                reservation("ROOM", ReservationStatus.CANCEL_REQUESTED, "2026-09-01", "2026-09-02", 1),
                reservation("PYEONGSANG", ReservationStatus.CANCEL_REQUESTED, "2026-09-04", "2026-09-05", 1),
                reservation("ROOM", ReservationStatus.CONFIRMED, "2026-09-30", "2026-10-02", 1)
        );
        when(repository.findAllOverlappingReservations(
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 10, 1), ReservationStatus.CANCELED
        )).thenReturn(reservations);

        var days = service.getAdminReservationCalendar(2026, 9);
        assertEquals(30, days.size());
        var first = days.getFirst();
        assertEquals(LocalDate.of(2026, 9, 1), first.getDate());
        assertEquals(1, first.getRoom().getConfirmed());
        assertEquals(1, first.getRoom().getPending());
        assertEquals(1, first.getPyeongsang().getConfirmed());
        assertEquals(1, first.getPyeongsang().getPending());
        assertEquals(1, first.getRoomConfirmedCount());
        assertEquals(1, first.getRoomPendingCount());
        assertEquals(1, first.getPyeongsangConfirmedCount());
        assertEquals(1, first.getPyeongsangPendingCount());
        assertEquals(5, first.getReservationCount());
        assertEquals(15, first.getReservedQuantity());
        assertEquals(1, first.getCancelRequestedCount());
        assertEquals(1, days.get(1).getRoom().getConfirmed());
        assertEquals(0, days.get(1).getRoom().getPending());
        assertEquals(0, days.get(1).getPyeongsang().getConfirmed());
        assertEquals(0, days.get(2).getPyeongsang().getConfirmed());
        assertEquals(0, days.get(2).getPyeongsang().getPending());
        assertEquals(LocalDate.of(2026, 9, 30), days.getLast().getDate());
        assertEquals(0, days.get(2).getReservationCount());
        assertEquals(1, days.get(3).getCancelRequestedCount());
        assertEquals(0, days.get(3).getPyeongsang().getPending());
        assertEquals(0, days.get(3).getPyeongsang().getConfirmed());
        assertEquals(0, days.get(3).getPyeongsangConfirmedCount());
        assertEquals(0, days.get(3).getPyeongsangPendingCount());

        var mapper = JsonMapper.builder().build();
        var response = mapper.readTree(mapper.writeValueAsString(days));
        var json = response.get(0);
        assertEquals("2026-09-01", json.get("date").asText());
        assertEquals(5, json.get("reservationCount").asInt());
        assertEquals(15, json.get("reservedQuantity").asInt());
        assertEquals(2, json.get("pendingCount").asInt());
        assertEquals(2, json.get("confirmedCount").asInt());
        assertEquals(1, json.get("cancelRequestedCount").asInt());
        for (String field : List.of("roomPendingCount", "roomConfirmedCount",
                "pyeongsangPendingCount", "pyeongsangConfirmedCount")) {
            assertTrue(json.get(field).isNumber());
            assertEquals(1, json.get(field).asInt());
            assertEquals(0, response.get(2).get(field).asInt());
        }
    }

    @Test
    void emptyMonthReturnsEveryDateWithZeroCounts() {
        when(repository.findAllOverlappingReservations(
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 10, 1), ReservationStatus.CANCELED
        )).thenReturn(List.of());
        var days = service.getAdminReservationCalendar(2026, 9);
        assertEquals(30, days.size());
        for (int index = 0; index < days.size(); index++) {
            var day = days.get(index);
            assertEquals(LocalDate.of(2026, 9, index + 1), day.getDate());
            assertEquals(0, day.getRoom().getPending());
            assertEquals(0, day.getRoom().getConfirmed());
            assertEquals(0, day.getPyeongsang().getPending());
            assertEquals(0, day.getPyeongsang().getConfirmed());
            assertEquals(0, day.getRoomPendingCount());
            assertEquals(0, day.getRoomConfirmedCount());
            assertEquals(0, day.getPyeongsangPendingCount());
            assertEquals(0, day.getPyeongsangConfirmedCount());
            assertEquals(0, day.getReservationCount());
            assertEquals(0, day.getReservedQuantity());
        }
    }

    @Test
    void includesStayDatesButExcludesCheckoutForFlatCounts() {
        var stay = reservation("ROOM", ReservationStatus.CONFIRMED,
                "2026-09-28", "2026-09-30", 4);
        when(repository.findAllOverlappingReservations(
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 10, 1), ReservationStatus.CANCELED
        )).thenReturn(List.of(stay));
        var days = service.getAdminReservationCalendar(2026, 9);
        assertEquals(1, days.get(27).getRoomConfirmedCount());
        assertEquals(1, days.get(28).getRoomConfirmedCount());
        assertEquals(0, days.get(29).getRoomConfirmedCount());
        assertEquals(0, days.get(28).getRoomPendingCount());
        assertEquals(0, days.get(28).getPyeongsangConfirmedCount());
        assertEquals(0, days.get(28).getPyeongsangPendingCount());
    }

    private Reservation reservation(String type, ReservationStatus status, String start, String end, int quantity) {
        Room room = mock(Room.class);
        when(room.getType()).thenReturn(type);
        Reservation reservation = mock(Reservation.class);
        when(reservation.getRoom()).thenReturn(room);
        when(reservation.getStatus()).thenReturn(status);
        when(reservation.getCheckIn()).thenReturn(LocalDate.parse(start));
        when(reservation.getCheckOut()).thenReturn(LocalDate.parse(end));
        when(reservation.getQuantity()).thenReturn(quantity);
        return reservation;
    }
}
