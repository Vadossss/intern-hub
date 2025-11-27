package com.diplom.internhubbackend.models.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterDto {
    private String email;
    private String phoneNumber;
    private String password;
}
