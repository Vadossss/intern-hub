package com.diplom.internhubbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.ResponseCookie;

@Getter
@Setter
@AllArgsConstructor
public class TokensCookieDto {
    ResponseCookie accessTokenCookie;
    ResponseCookie refreshTokenCookie;
}
