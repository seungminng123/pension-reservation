package com.pension.backend.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private Integer maxGuests;

    @Column(nullable = false)
    private Integer guestCount;

    // 전체 재고
    @Column(
            nullable = false,
            columnDefinition = "INT NOT NULL DEFAULT 1"
    )
    private Integer stockCount = 1;

    // 삭제 여부
    @Column(
            nullable = false,
            columnDefinition = "BOOLEAN NOT NULL DEFAULT TRUE"
    )
    private boolean active = true;

    // 판매 여부
    @Column(
            nullable = false,
            columnDefinition = "BOOLEAN NOT NULL DEFAULT TRUE"
    )
    private boolean saleEnabled = true;

    public Room(
            String type,
            String name,
            String description,
            Long price,
            Integer maxGuests,
            Integer guestCount,
            Integer stockCount,
            boolean saleEnabled
    ) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.price = price;
        this.maxGuests = maxGuests;
        this.guestCount = guestCount;
        this.stockCount = stockCount;
        this.saleEnabled = saleEnabled;
        this.active = true;
    }

    // 객실 수정
    public void update(
            String type,
            String name,
            String description,
            Long price,
            Integer maxGuests,
            Integer guestCount,
            Integer stockCount,
            Boolean saleEnabled
    ) {
        if (type != null) this.type = type;
        if (name != null) this.name = name;
        if (description != null) this.description = description;
        if (price != null) this.price = price;
        if (maxGuests != null) this.maxGuests = maxGuests;
        if (guestCount != null) this.guestCount = guestCount;
        if (stockCount != null) this.stockCount = stockCount;
        if (saleEnabled != null) this.saleEnabled = saleEnabled;
    }

    // 객실 삭제
    public void deactivate() {
        this.active = false;
        this.saleEnabled = false;
    }
}