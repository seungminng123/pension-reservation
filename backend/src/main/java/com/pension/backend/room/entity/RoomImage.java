package com.pension.backend.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "room_images")
public class RoomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomImageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "room_id",
            nullable = false
    )
    private Room room;

    @Lob
    @Column(
            nullable = false,
            columnDefinition = "LONGBLOB"
    )
    private byte[] imageData;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Integer displayOrder;

    public RoomImage(
            Room room,
            byte[] imageData,
            String contentType,
            Integer displayOrder
    ) {
        this.room = room;
        this.imageData = imageData;
        this.contentType = contentType;
        this.displayOrder = displayOrder;
    }

    // 이미지 순서 변경
    public void updateDisplayOrder(
            Integer displayOrder
    ) {
        this.displayOrder = displayOrder;
    }
}