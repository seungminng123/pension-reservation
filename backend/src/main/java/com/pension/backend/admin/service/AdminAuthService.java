package com.pension.backend.admin.service;

import com.pension.backend.admin.dto.AdminLoginRequest;
import com.pension.backend.admin.dto.AdminLoginResponse;
import com.pension.backend.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final JwtProvider jwtProvider;

    @Value("${admin.login-id}")
    private String adminLoginId;

    @Value("${admin.password}")
    private String adminPassword;

    public AdminLoginResponse login(
            AdminLoginRequest request
    ) {
        if (
                !adminLoginId.equals(request.getLoginId())
                        || !adminPassword.equals(request.getPassword())
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "관리자 로그인 정보가 올바르지 않습니다."
            );
        }

        return new AdminLoginResponse(
                jwtProvider.createToken(
                        request.getLoginId()
                )
        );
    }
}