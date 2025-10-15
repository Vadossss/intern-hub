package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.TokenResponse;
import com.diplom.internhubbackend.security.jwt.JwtHelper;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final CustomUserDetailsService customUserDetailsService;

    private final JwtHelper jwtHelper;

    public TokenService(CustomUserDetailsService customUserDetailsService, JwtHelper jwtHelper) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtHelper = jwtHelper;
    }

//    public TokenResponse generateToken()
}
