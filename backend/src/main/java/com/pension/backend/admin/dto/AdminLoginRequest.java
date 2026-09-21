package com.pension.backend.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class AdminLoginRequest {

    @NotBlank
    @Schema(example = "admin")
    private String loginId;

    @NotBlank
    @Schema(example = "password")
    private String password;
}