package com.diplom.internhubbackend.test;

import com.diplom.internhubbackend.exception.PasswordIncorrectException;
import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.dto.TokensCookieDto;
import com.diplom.internhubbackend.models.dto.UserRegisterDto;
import com.diplom.internhubbackend.repositories.UserRepository;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.AuthService;
import com.diplom.internhubbackend.services.CustomUserDetailsService;
import com.diplom.internhubbackend.services.AuthUtilService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthUtilService authUtilService;

    @Mock
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void loginUserWhenEmailIsNull() {
        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setEmail(null);

        assertThrows(UserNotFoundException.class, () -> authService.loginUser(userRegisterDto));
    }

    @Test
    void loginUserWhenUserNotFound() {
        String email = "test@example.com";
        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setEmail(email);

        when(userRepository.existsByEmail(email)).thenReturn(false);

        assertThrows(UserNotFoundException.class, () -> authService.loginUser(userRegisterDto));
    }

    @Test
    void loginUserWhenPasswordIsIncorrect() {
        String email = "test@example.com";
        String rawPassword = "password123";
        String encodedPassword = "$2a$10$qvQCw1WdFb4biti4AdFECehYW9tZ2XFW8i5Izhpo/5dYxi3Y8pUpO";

        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setEmail(email);
        userRegisterDto.setPassword(rawPassword);

        User user = new User();
        user.setEmail(email);
        user.setPassword(encodedPassword);

        when(userRepository.existsByEmail(email)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(authUtilService.passwordMatches(rawPassword, encodedPassword)).thenReturn(false);

        assertThrows(PasswordIncorrectException.class, () -> authService.loginUser(userRegisterDto));
    }

    @Test
    void loginUserCorrect() {
        String email = "test@example.com";
        String rawPassword = "password123";
        String encodedPassword = "$2a$10$qvQCw1WdFb4biti4AdFECehYW9tZ2XFW8i5Izhpo/5dYxi3Y8pUpO";

        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setEmail(email);
        userRegisterDto.setPassword(rawPassword);

        User user = new User();
        user.setEmail(email);
        user.setPassword(encodedPassword);

        CustomUserDetails customUserDetails = mock(CustomUserDetails.class);
        TokensCookieDto tokensCookieDto = mock(TokensCookieDto.class);

        when(userRepository.existsByEmail(email)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(authUtilService.passwordMatches(rawPassword, encodedPassword)).thenReturn(true);
        when(customUserDetailsService.loadUserByUsername(email)).thenReturn(customUserDetails);
        when(authUtilService.generateAuthResponse(customUserDetails)).thenReturn(tokensCookieDto);

        TokensCookieDto result = authService.loginUser(userRegisterDto);

        assertNotNull(result);
        assertEquals(tokensCookieDto, result);
    }
}
