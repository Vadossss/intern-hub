package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.*;
import com.diplom.internhubbackend.models.JwtPair;
import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.dto.TokensCookieDto;
import com.diplom.internhubbackend.models.dto.UserRegisterDto;
import com.diplom.internhubbackend.models.enums.UserRole;
import com.diplom.internhubbackend.repositories.RoleRepository;
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
    private final AuthUtilService authUtilService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final CustomUserDetailsService customUserDetailsService;
    private final RoleRepository roleRepository;

    public AuthService(UserRepository userRepository, AuthUtilService authUtilService, JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.authUtilService = authUtilService;
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
        this.roleRepository = roleRepository;
    }

    public TokensCookieDto registerUser(User user) {
        if (user.getEmail() != null && existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
//        else {
//            if (user.getPhoneNumber() != null && existsByPhoneNumber(user.getPhoneNumber())) {
//                throw new PhoneNumberAlreadyExistsException("Phone Number already exists");
//            }
//        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Role role = roleRepository.findById(UserRole.ROLE_USER.name())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setRole(role);

        userRepository.save(user);
        CustomUserDetails customUserDetails = customUserDetailsService.loadUserByUsername(user.getEmail());

        if (customUserDetails == null) {
            throw new TokenGenerationException("Failed to load user details for token generation");
        }
        return authUtilService.generateAuthResponse(customUserDetailsService.loadUserByUsername(user.getEmail()));
    }

    public TokensCookieDto loginUser(UserRegisterDto userRegisterDto) {
        String email = userRegisterDto.getEmail();

        if (email == null) {
            throw new UserNotFoundException("Email or phone number is incorrect");
        }

        User user;
        if (existsByEmail(email)) {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException(email));
        } else {
            throw new UserNotFoundException("Email or phone number is incorrect");
        }

        if (authUtilService.passwordMatches(userRegisterDto.getPassword(), user.getPassword())) {
            return authUtilService.generateAuthResponse(customUserDetailsService.loadUserByUsername(user.getEmail()));
        } else {
            throw new PasswordIncorrectException("Incorrect password");
        }
    }

    public Boolean validateToken(HttpServletRequest request) {
        String accessToken = null;
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                    break;
                }
            }
        }

        if (accessToken == null) {
            throw new RefreshTokenException("Access token not found");
        }

        CustomUserDetails customUserDetails = jwtUtil.parseJwtToken(accessToken);

        if (customUserDetails != null) {
            return true;
        }
        else {
            throw new RefreshTokenException("Access token expired");
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
            return authUtilService.generateAuthResponse(customUserDetails);
        }
        else {
            throw new RefreshTokenException("Refresh token expired");
        }
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
