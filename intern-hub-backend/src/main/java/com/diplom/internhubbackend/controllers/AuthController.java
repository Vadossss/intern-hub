package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.*;
import com.diplom.internhubbackend.mapper.UserMapper;
import com.diplom.internhubbackend.models.CandidateProfile;
import com.diplom.internhubbackend.models.EmployerProfile;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.repositories.CandidateProfileRepository;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.AuthService;
import com.diplom.internhubbackend.services.AuthTokenService;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.service.spi.ServiceException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Key;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserMapper userMapper;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final AuthTokenService authTokenService;

    public AuthController(
            AuthService authService,
            UserMapper userMapper,
            CandidateProfileRepository candidateProfileRepository,
            EmployerProfileRepository employerProfileRepository,
            AuthTokenService authTokenService
    ) {
        this.authService = authService;
        this.userMapper = userMapper;
        this.candidateProfileRepository = candidateProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.authTokenService = authTokenService;
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User is successfully signed up"),
            @ApiResponse(responseCode = "400", description = "One of Username already exists or Email already exists")
    })
    @Operation(summary = "Регистрация пользователя")
    @PostMapping("/register")
    public ResponseEntity<Object> registerUser(@RequestBody final UserRegisterDto userRegisterDto) throws ServiceException {
        TokensCookieDto tokensCookieDto = authService.registerUser(userMapper.fromDto(userRegisterDto));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getRefreshTokenCookie().toString())
                .body(tokensCookieDto.getAccessTokenCookie().getValue());
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User is successfully signed up"),
            @ApiResponse(responseCode = "400", description = "One of Username already exists or Email already exists")
    })
    @Operation(summary = "Аутентификация пользователя")
    @PostMapping("/login")
    public ResponseEntity<Object> loginUser(@RequestBody final UserRegisterDto userRegisterDto) throws ServiceException {
        TokensCookieDto tokensCookieDto = authService.loginUser(userRegisterDto);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getRefreshTokenCookie().toString())
                .body(tokensCookieDto.getAccessTokenCookie().getValue());
    }

    @Operation(summary = "Обновление пары токенов")
    @PostMapping("/update-refresh-token")
    public ResponseEntity<Object> updateRefreshToken(
            @Parameter(hidden = true)
            @CookieValue("refreshToken") String refreshToken
    ) {
        TokensCookieDto tokensCookieDto = authService.updateRefreshToken(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getRefreshTokenCookie().toString())
                .body(tokensCookieDto.getAccessTokenCookie().getValue());
    }

    @Operation(summary = "Logout пользователя")
    @PostMapping("/logout")
    public ResponseEntity<Object> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
    ) {
        TokensCookieDto tokensCookieDto = authService.logout(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getRefreshTokenCookie().toString())
                .body("Successfully logged out");
    }

    @Operation(summary = "Подтвердить почту пользователя")
    @PostMapping("/email/verify")
    public MessageResponseDto verifyEmail(@RequestParam String token) {
        authTokenService.verifyEmail(token);
        return new MessageResponseDto("Email verified");
    }

    @Operation(summary = "Повторно отправить письмо подтверждения почты")
    @PostMapping("/email/verification/resend")
    public MessageResponseDto resendEmailVerification(@RequestBody EmailRequestDto request) {
        authTokenService.resendEmailVerification(request.getEmail());
        return new MessageResponseDto("Email verification sent");
    }

    @Operation(summary = "Изменить почту текущего пользователя")
    @PostMapping("/email/change")
    public ResponseEntity<AuthMeResponseDto> changeEmail(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody EmailRequestDto request
    ) {
        if (customUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User updatedUser = authTokenService.changeEmail(
                customUserDetails.getUser().getId(),
                request.getEmail()
        );

        CandidateProfile candidateProfile = candidateProfileRepository
                .findByUserId(updatedUser.getId())
                .orElse(null);
        EmployerProfile employerProfile = employerProfileRepository
                .findByUserId(updatedUser.getId())
                .orElse(null);

        return ResponseEntity.ok(AuthMeResponseDto.fromUser(
                updatedUser,
                candidateProfile != null ? candidateProfile.getFirstName() : null,
                candidateProfile != null ? candidateProfile.getLastName() : null,
                employerProfile != null ? employerProfile.getCompanyName() : null,
                candidateProfile != null
                        ? candidateProfile.getCity()
                        : employerProfile != null ? employerProfile.getCity() : null
        ));
    }

    @Operation(summary = "Запросить письмо для смены пароля")
    @PostMapping("/password/forgot")
    public MessageResponseDto forgotPassword(@RequestBody EmailRequestDto request) {
        authTokenService.requestPasswordReset(request.getEmail());
        return new MessageResponseDto("Password reset email sent");
    }

    @Operation(summary = "Сменить пароль по токену из письма")
    @PostMapping("/password/reset")
    public MessageResponseDto resetPassword(@RequestBody PasswordResetRequestDto request) {
        authTokenService.resetPassword(request.getToken(), request.getPassword());
        return new MessageResponseDto("Password changed");
    }

    @GetMapping("/me")
    public ResponseEntity<AuthMeResponseDto> me(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CandidateProfile candidateProfile = candidateProfileRepository
                .findByUserId(customUserDetails.getUser().getId())
                .orElse(null);
        EmployerProfile employerProfile = employerProfileRepository
                .findByUserId(customUserDetails.getUser().getId())
                .orElse(null);

        return ResponseEntity.ok(AuthMeResponseDto.fromUser(
                customUserDetails.getUser(),
                candidateProfile != null ? candidateProfile.getFirstName() : null,
                candidateProfile != null ? candidateProfile.getLastName() : null,
                employerProfile != null ? employerProfile.getCompanyName() : null,
                candidateProfile != null
                        ? candidateProfile.getCity()
                        : employerProfile != null ? employerProfile.getCity() : null
        ));
    }

    @GetMapping("generate")
    public String generateToken() {
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        return Encoders.BASE64.encode(key.getEncoded());
    }
}
