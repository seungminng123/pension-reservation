package com.pension.backend.admin.dto;

import lombok.Getter;

@Getter
public class AdminLoginResponse {

    private final String accessToken;

    public AdminLoginResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}