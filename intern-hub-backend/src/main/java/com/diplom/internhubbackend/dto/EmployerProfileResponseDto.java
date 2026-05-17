package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.VerificationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EmployerProfileResponseDto {
    private Integer userId;
    private String email;
    private String companyName;
    private String city;
    private String website;
    private String contactName;
    private String phone;
    private String about;
    private String avatarUrl;
    private Boolean aggregated;
    private Boolean accredited;
    private Boolean verified;
    private VerificationStatus verificationStatus;
    private LocalDateTime createdAt;
}
