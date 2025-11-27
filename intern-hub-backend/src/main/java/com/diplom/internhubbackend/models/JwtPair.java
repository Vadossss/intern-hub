package com.diplom.internhubbackend.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class JwtPair {
    private String accessToken;
    private String refreshToken;
}
