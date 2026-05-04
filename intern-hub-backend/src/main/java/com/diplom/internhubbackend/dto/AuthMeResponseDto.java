package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.VerificationStatus;
import com.diplom.internhubbackend.models.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AuthMeResponseDto {
    private Integer id;
    private String email;
    private String phoneNumber;
    private String city;
    private String firstName;
    private String lastName;
    private String companyName;
    private String role;
    private AccountStatus status;
    private Boolean verified;
    private VerificationStatus verificationStatus;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AuthMeResponseDto fromUser(User user) {
        return AuthMeResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .city(user.getCity())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .companyName(user.getCompanyName())
                .role(user.getRole() != null ? user.getRole().getId() : null)
                .status(user.getStatus())
                .verified(user.getVerified())
                .verificationStatus(user.getVerificationStatus())
                .verifiedAt(user.getVerifiedAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
