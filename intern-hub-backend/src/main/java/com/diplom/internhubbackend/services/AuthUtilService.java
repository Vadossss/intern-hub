package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.JwtPair;
import com.diplom.internhubbackend.models.dto.TokensCookieDto;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.security.jwt.JwtUtil;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthUtilService {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;

    public AuthUtilService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public boolean passwordMatches(String password, String hashedPassword) {
        return passwordEncoder.matches(password, hashedPassword);
    }

    public TokensCookieDto generateAuthResponse(CustomUserDetails customUserDetails) {
        JwtPair tokens = jwtUtil.generateTokenPair(customUserDetails);
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", tokens.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .build();

        return new TokensCookieDto(accessTokenCookie, refreshTokenCookie);
    }
}
