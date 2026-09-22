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

    // 객실 이미지
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imageData;

    private String imageContentType;

    public Room(
            String type,
            String name,
            String description,
            Long price,
            Integer maxGuests,
            Integer guestCount
    ) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.price = price;
        this.maxGuests = maxGuests;
        this.guestCount = guestCount;
    }

    // 객실 수정
    public void update(
            String type,
            String name,
            String description,
            Long price,
            Integer maxGuests,
            Integer guestCount
    ) {
        if (type != null) this.type = type;
        if (name != null) this.name = name;
        if (description != null) this.description = description;
        if (price != null) this.price = price;
        if (maxGuests != null) this.maxGuests = maxGuests;
        if (guestCount != null) this.guestCount = guestCount;
    }

    // 이미지 수정
    public void updateImage(
            byte[] imageData,
            String imageContentType
    ) {
        this.imageData = imageData;
        this.imageContentType = imageContentType;
    }
}