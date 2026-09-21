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

    private String imageUrl;

    public Room(
            String type,
            String name,
            String description,
            Long price,
            Integer maxGuests,
            Integer guestCount,
            String imageUrl
    ) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.price = price;
        this.maxGuests = maxGuests;
        this.guestCount = guestCount;
        this.imageUrl = imageUrl;
    }

    public void update(
            String type,
            String name,
            String description,
            Long price,
            Integer maxGuests,
            Integer guestCount,
            String imageUrl
    ) {
        if (type != null) this.type = type;
        if (name != null) this.name = name;
        if (description != null) this.description = description;
        if (price != null) this.price = price;
        if (maxGuests != null) this.maxGuests = maxGuests;
        if (guestCount != null) this.guestCount = guestCount;
        if (imageUrl != null) this.imageUrl = imageUrl;
    }
}