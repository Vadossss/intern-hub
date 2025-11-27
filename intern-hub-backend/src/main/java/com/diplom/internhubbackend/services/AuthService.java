package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.*;
import com.diplom.internhubbackend.models.JwtPair;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.dto.TokensCookieDto;
import com.diplom.internhubbackend.models.dto.UserRegisterDto;
import com.diplom.internhubbackend.repositories.UserRepository;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.security.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final CustomUserDetailsService customUserDetailsService;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    public TokensCookieDto registerUser(User user) {
        if (user.getEmail() != null && existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        else {
            if (user.getPhoneNumber() != null && existsByPhoneNumber(user.getPhoneNumber())) {
                throw new PhoneNumberAlreadyExistsException("Phone Number already exists");
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
        CustomUserDetails customUserDetails = customUserDetailsService.loadUserByUsername(user.getEmail());

        if (customUserDetails == null) {
            throw new TokenGenerationException("Failed to load user details for token generation");
        }
        return generateAuthResponse(customUserDetailsService.loadUserByUsername(user.getEmail()));
    }

    public TokensCookieDto loginUser(UserRegisterDto userRegisterDto) {
        String email = userRegisterDto.getEmail();
        String phone = userRegisterDto.getPhoneNumber();

        if (email == null && phone == null) {
            throw new UserNotFoundException("Email or phone number is incorrect");
        }

        User user;
        if (email != null && existsByEmail(email)) {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException(email));
        } else if (phone != null && existsByPhoneNumber(phone)) {
            user = userRepository.findByPhoneNumber(phone)
                    .orElseThrow(() -> new UserNotFoundException(phone));
        } else {
            throw new UserNotFoundException("Email or phone number is incorrect");
        }

        if (passwordMatches(userRegisterDto.getPassword(), user.getPassword())) {
            return generateAuthResponse(customUserDetailsService.loadUserByUsername(user.getEmail()));
        } else {
            throw new PasswordIncorrectException("Incorrect password");
        }
    }

    public TokensCookieDto updateRefreshToken(HttpServletRequest request) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            throw new RefreshTokenException("Refresh token not found");
        }

        CustomUserDetails customUserDetails = jwtUtil.parseJwtToken(refreshToken);

        if (customUserDetails != null) {
            return generateAuthResponse(customUserDetails);
        }
        else {
            throw new RefreshTokenException("Refresh token expired");
        }
    }

    private TokensCookieDto generateAuthResponse(CustomUserDetails customUserDetails) {
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

    public boolean passwordMatches(String password, String hashedPassword) {
        return passwordEncoder.matches(password, hashedPassword);
    }
}
