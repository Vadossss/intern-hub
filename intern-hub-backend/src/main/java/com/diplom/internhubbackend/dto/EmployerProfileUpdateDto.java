package com.diplom.internhubbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployerProfileUpdateDto {
    private String companyName;
    private String city;
    private String website;
    private String contactName;
    private String phone;
    private String about;
    private String avatarUrl;
}
