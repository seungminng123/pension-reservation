package com.pension.backend.admin.controller;

import com.pension.backend.admin.dto.AdminLoginRequest;
import com.pension.backend.admin.dto.AdminLoginResponse;
import com.pension.backend.admin.service.AdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@Tag(name = "관리자 인증")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @Operation(summary = "관리자 로그인")
    @PostMapping("/login")
    public AdminLoginResponse login(
            @Valid @RequestBody AdminLoginRequest request
    ) {
        return adminAuthService.login(request);
    }
}