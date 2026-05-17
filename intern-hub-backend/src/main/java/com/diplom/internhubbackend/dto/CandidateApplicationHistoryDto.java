package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.models.Currency;
import com.diplom.internhubbackend.models.Employment;
import com.diplom.internhubbackend.models.Experience;
import com.diplom.internhubbackend.models.WorkFormat;

import java.time.LocalDateTime;

public record CandidateApplicationHistoryDto(
        Long applicationId,
        String vacancyPublicId,
        String vacancyTitle,
        String directionId,
        String direction,
        String city,
        Long salaryFrom,
        Long salaryTo,
        Currency currency,
        Employment employment,
        Experience experience,
        WorkFormat workFormat,
        CandidateApplicationEmployerDto employer,
        String status,
        Boolean archived,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt
) {
}
