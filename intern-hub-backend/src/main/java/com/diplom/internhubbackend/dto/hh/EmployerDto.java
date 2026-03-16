package com.diplom.internhubbackend.dto.hh;

import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.enums.VerificationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class EmployerDto {
    private String companyName;
    private String city;
    private Role role;
    private Boolean isAggregated;
    private Boolean verified;
    private VerificationStatus verificationStatus;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
