package com.pension.backend.room.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RoomImageResponse {

    private byte[] data;

    private String contentType;
}