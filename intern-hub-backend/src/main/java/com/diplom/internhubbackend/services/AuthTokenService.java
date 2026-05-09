package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.enums.AuthTokenType;
import com.diplom.internhubbackend.enums.VerificationStatus;
import com.diplom.internhubbackend.exception.EmailAlreadyExistsException;
import com.diplom.internhubbackend.exception.RefreshTokenException;
import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.AuthToken;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.repositories.AuthTokenRepository;
import com.diplom.internhubbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthTokenService {
    private static final int EMAIL_VERIFICATION_HOURS = 24;
    private static final int PASSWORD_RESET_MINUTES = 30;

    private final AuthTokenRepository authTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public void sendEmailVerification(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        AuthToken token = createToken(user, AuthTokenType.EMAIL_VERIFICATION, EMAIL_VERIFICATION_HOURS * 60);
        String link = frontendUrl + "/auth/verify-email?token=" + token.getValue();

        emailService.sendSimpleEmail(
                user.getEmail(),
                "Подтверждение почты InternHub",
                "Подтвердите почту по ссылке:\n\n" + link + "\n\nЕсли вы не регистрировались в InternHub, просто проигнорируйте письмо."
        );
    }

    @Transactional
    public void resendEmailVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.getVerified())) {
            return;
        }

        sendEmailVerification(user);
    }

    @Transactional
    public User changeEmail(Integer userId, String email) {
        if (email == null || email.isBlank()) {
            throw new RefreshTokenException("Email is required");
        }

        String nextEmail = email.trim();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (nextEmail.equals(user.getEmail())) {
            return user;
        }

        if (userRepository.existsByEmail(nextEmail)) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        user.setEmail(nextEmail);
        user.setVerified(false);
        user.setVerificationStatus(VerificationStatus.EXPECTATION);
        user.setVerifiedAt(null);

        User saved = userRepository.save(user);
        sendEmailVerification(saved);
        return saved;
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        AuthToken token = getValidToken(tokenValue, AuthTokenType.EMAIL_VERIFICATION);
        User user = token.getUser();

        user.setVerified(true);
        user.setVerificationStatus(VerificationStatus.CONFIRMED);
        user.setVerifiedAt(LocalDateTime.now());
        token.setUsed(true);

        userRepository.save(user);
        authTokenRepository.save(token);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        AuthToken token = createToken(user, AuthTokenType.PASSWORD_RESET, PASSWORD_RESET_MINUTES);
        String link = frontendUrl + "/auth/reset-password?token=" + token.getValue();

        emailService.sendSimpleEmail(
                user.getEmail(),
                "Смена пароля InternHub",
                "Чтобы сменить пароль, перейдите по ссылке:\n\n" + link + "\n\nСсылка действует 30 минут."
        );
    }

    @Transactional
    public void resetPassword(String tokenValue, String password) {
        if (password == null || password.isBlank()) {
            throw new RefreshTokenException("Password is required");
        }

        AuthToken token = getValidToken(tokenValue, AuthTokenType.PASSWORD_RESET);
        User user = token.getUser();

        user.setPassword(passwordEncoder.encode(password));
        token.setUsed(true);

        userRepository.save(user);
        authTokenRepository.save(token);
    }

    private AuthToken createToken(User user, AuthTokenType type, int ttlMinutes) {
        AuthToken token = AuthToken.builder()
                .value(UUID.randomUUID().toString())
                .user(user)
                .type(type)
                .expiresAt(LocalDateTime.now().plusMinutes(ttlMinutes))
                .build();

        return authTokenRepository.save(token);
    }

    private AuthToken getValidToken(String tokenValue, AuthTokenType type) {
        if (tokenValue == null || tokenValue.isBlank()) {
            throw new RefreshTokenException("Token is required");
        }

        AuthToken token = authTokenRepository.findByValueAndType(tokenValue, type)
                .orElseThrow(() -> new RefreshTokenException("Invalid token"));

        if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RefreshTokenException("Token expired or already used");
        }

        return token;
    }
}
