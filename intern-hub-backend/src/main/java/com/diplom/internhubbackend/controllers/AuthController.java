package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.mapper.UserMapper;
import com.diplom.internhubbackend.models.dto.TokensCookieDto;
import com.diplom.internhubbackend.models.dto.UserRegisterDto;
import com.diplom.internhubbackend.services.AuthService;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.service.spi.ServiceException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Key;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final UserMapper userMapper;

    public AuthController(AuthService authService, UserMapper userMapper) {
        this.authService = authService;
        this.userMapper = userMapper;
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

    @GetMapping("/validateToken")
    public ResponseEntity<Object> validateToken(HttpServletRequest request) {
        return ResponseEntity.ok().body(authService.validateToken(request));
    }

    @PostMapping("/updateRefreshToken")
    public ResponseEntity<Object> updateRefreshToken(HttpServletRequest request) {
        TokensCookieDto tokensCookieDto = authService.updateRefreshToken(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, tokensCookieDto.getRefreshTokenCookie().toString())
                .body(tokensCookieDto.getAccessTokenCookie().getValue());
    }

    @GetMapping("generate")
    public String generateToken() {
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        return Encoders.BASE64.encode(key.getEncoded());
    }
}
