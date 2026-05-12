package com.diplom.internhubbackend.dto.projection;

import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.enums.VerificationStatus;
import com.diplom.internhubbackend.models.Currency;
import com.diplom.internhubbackend.models.Employment;
import com.diplom.internhubbackend.models.Experience;
import com.diplom.internhubbackend.models.WorkFormat;

import java.time.LocalDateTime;

public record VacancyProjection(
        Integer id,
        String publicId,
        String title,
        String directionId,
        String direction,
        String description,
        String city,
        VacancyStatus status,
        Long salaryFrom,
        Long salaryTo,
        Currency currency,
        Employment employment,
        Experience experience,
        WorkFormat workFormat,
        Integer employerId,
        String employerCompanyName,
        String employerCity,
        String employerAvatarUrl,
        Boolean employerAggregated,
        Boolean employerAccredited,
        Boolean employerVerified,
        VerificationStatus employerVerificationStatus,
        LocalDateTime employerVerifiedAt,
        LocalDateTime employerCreatedAt,
        LocalDateTime employerUpdatedAt,
        AccountStatus employerStatus
) {
}
