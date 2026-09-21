package com.pension.backend.reservation.entity;

public enum ReservationStatus {
    PENDING,            // 입금 대기
    CONFIRMED,          // 예약 확정
    CANCEL_REQUESTED,   // 취소 요청
    CANCELED            // 예약 취소
}