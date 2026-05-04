package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.RefreshTokenException;
import com.diplom.internhubbackend.models.RefreshToken;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${security.refreshTokenExpirationTime}")
    private int refreshTokenExpirationTime;

    private final RefreshTokenRepository refreshTokenRepository;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Base64.Encoder base64Encoder =
            Base64.getUrlEncoder().withoutPadding();

    public String createRefreshToken(User user) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = base64Encoder.encodeToString(randomBytes);
        RefreshToken refreshToken = RefreshToken
                .builder()
                .value(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationTime))
                .build();

        refreshTokenRepository.save(refreshToken);

        return token;
    }

    public User updateRefreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByValue(refreshTokenValue)
                .orElseThrow(() -> new RefreshTokenException("Invalid refresh"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RefreshTokenException("Invalid refresh, refresh token is revoked or expired");
        }

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        if (user == null) {
            throw new RefreshTokenException("Invalid refresh, user not found");
        }

        if (isBlocked(user)) {
            throw new RefreshTokenException("User account is blocked");
        }

        return user;
    }

    @Transactional
    public void revokeRefreshToken(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            return;
        }

        refreshTokenRepository.findByValue(refreshTokenValue)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    private boolean isBlocked(User user) {
        if (user.getStatus() != AccountStatus.BLOCKED) {
            return false;
        }

        return user.getBlockedUntil() == null || user.getBlockedUntil().isAfter(LocalDateTime.now());
    }
}
