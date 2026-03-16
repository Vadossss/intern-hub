package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.*;
import com.diplom.internhubbackend.models.JwtPair;
import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.dto.TokensCookieDto;
import com.diplom.internhubbackend.dto.UserRegisterDto;
import com.diplom.internhubbackend.enums.UserRole;
import com.diplom.internhubbackend.repositories.RoleRepository;
import com.diplom.internhubbackend.repositories.UserRepository;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.security.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final AuthUtilService authUtilService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final CustomUserDetailsService customUserDetailsService;
    private final RoleRepository roleRepository;
    private final UserRoleService useRoleService;
    private final UserRoleService userRoleService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public TokensCookieDto registerUser(User user) {
        if (user.getEmail() != null && existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Role role = userRoleService.findRoleById(UserRole.ROLE_USER.name());

        user.setRole(role);

        userRepository.save(user);

        if (user.getEmail() == null) {
            throw new TokenGenerationException("Failed to load user details for token generation");
        }
        return authUtilService.generateAuthResponse(user);
    }

    @Transactional
    public TokensCookieDto loginUser(UserRegisterDto userRegisterDto) {
        String email = userRegisterDto.getEmail();

        if (email == null) {
            throw new UserNotFoundException("Email or phone number is incorrect");
        }

        User user = userRepository.findByEmail(email).
                orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!authUtilService.passwordMatches(userRegisterDto.getPassword(), user.getPassword())) {
            throw new PasswordIncorrectException("Incorrect password");
        }

        return authUtilService.generateAuthResponse(user);
    }

//    public Boolean validateToken(HttpServletRequest request) {
//        String accessToken = null;
//        if (request.getCookies() != null) {
//            for (var cookie : request.getCookies()) {
//                if ("accessToken".equals(cookie.getName())) {
//                    accessToken = cookie.getValue();
//                    break;
//                }
//            }
//        }
//
//        if (accessToken == null) {
//            throw new RefreshTokenException("Access token not found");
//        }
//
//        CustomUserDetails customUserDetails = jwtUtil.parseJwtToken(accessToken);
//
//        if (customUserDetails != null) {
//            return true;
//        }
//        else {
//            throw new RefreshTokenException("Access token expired");
//        }
//    }

    public TokensCookieDto updateRefreshToken(String refreshToken) {

        if (refreshToken == null) {
            throw new RefreshTokenException("Refresh token not found");
        }

        return authUtilService.refreshTokens(refreshToken);
    }

//    public TokensCookieDto generateAuthResponse(CustomUserDetails customUserDetails) {
//        JwtPair tokens = jwtUtil.generateTokenPair(customUserDetails);
//        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
//                .httpOnly(true)
//                .secure(false)
//                .sameSite("Lax")
//                .path("/")
//                .maxAge(Duration.ofDays(7))
//                .build();
//
//        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", tokens.getAccessToken())
//                .httpOnly(true)
//                .secure(false)
//                .sameSite("Lax")
//                .path("/")
//                .maxAge(Duration.ofMinutes(30))
//                .build();
//
//        return new TokensCookieDto(accessTokenCookie, refreshTokenCookie);
//    }

    @Transactional
    public boolean existsByEmail(final String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public boolean existsByPhoneNumber(final String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

//    public boolean passwordMatches(String password, String hashedPassword) {
//        return passwordEncoder.matches(password, hashedPassword);
//    }
}
