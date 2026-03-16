package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.JwtPair;
import com.diplom.internhubbackend.dto.TokensCookieDto;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthUtilService {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public boolean passwordMatches(String password, String hashedPassword) {
        return passwordEncoder.matches(password, hashedPassword);
    }

    public JwtPair generateTokenPair(User user) {
        return new JwtPair(
                jwtUtil.createAccessToken(user),
                refreshTokenService.createRefreshToken(user)
        );
    }

    private TokensCookieDto buildResponse(String accessToken, String refreshToken) {
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .build();

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        return new TokensCookieDto(accessTokenCookie, refreshTokenCookie);
    }

    public TokensCookieDto generateAuthResponse(User user) {
        String accessToken = jwtUtil.createAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return buildResponse(accessToken, refreshToken);
    }

    public TokensCookieDto refreshTokens(String refreshTokenValue) {
        User user = refreshTokenService.updateRefreshToken(refreshTokenValue);

        String accessToken = jwtUtil.createAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return buildResponse(accessToken, refreshToken);
    }
}
