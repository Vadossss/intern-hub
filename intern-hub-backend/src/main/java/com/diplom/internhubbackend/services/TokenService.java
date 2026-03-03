package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.security.jwt.JwtUtil;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final CustomUserDetailsService customUserDetailsService;

    private final JwtUtil jwtUtil;

    public TokenService(CustomUserDetailsService customUserDetailsService, JwtUtil jwtUtil) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtil = jwtUtil;
    }
}
