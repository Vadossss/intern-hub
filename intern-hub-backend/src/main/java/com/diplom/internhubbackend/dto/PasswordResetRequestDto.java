package com.diplom.internhubbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequestDto {
    private String token;
    private String password;
}
