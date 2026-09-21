package com.pension.backend.price.entity;

import com.pension.backend.room.entity.Room;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "room_daily_prices",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_room_daily_price_room_date",
                        columnNames = {"room_id", "price_date"}
                )
        }
)
public class RoomDailyPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dailyPriceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "price_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long price;

    public RoomDailyPrice(
            Room room,
            LocalDate date,
            Long price
    ) {
        this.room = room;
        this.date = date;
        this.price = price;
    }

    public void updatePrice(Long price) {
        this.price = price;
    }
}