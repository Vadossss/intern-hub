package com.diplom.internhubbackend.dto.projection;

import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.enums.VerificationStatus;
import com.diplom.internhubbackend.models.Currency;
import com.diplom.internhubbackend.models.Employment;
import com.diplom.internhubbackend.models.Experience;
import com.diplom.internhubbackend.models.WorkFormat;

import java.time.LocalDateTime;

public record VacancyListProjection(
        Integer id,
        String publicId,
        String title,
        String city,
        VacancyStatus status,
        Long salaryFrom,
        Long salaryTo,
        Currency currency,
        Employment employment,
        Experience experience,
        WorkFormat workFormat,
        String directionId,
        String direction,
        Integer employerId,
        String employerAvatarUrl,
        Boolean employerVerified,
        VerificationStatus employerVerificationStatus,
        LocalDateTime employerVerifiedAt,
        LocalDateTime employerCreatedAt,
        LocalDateTime employerUpdatedAt
) {
}
