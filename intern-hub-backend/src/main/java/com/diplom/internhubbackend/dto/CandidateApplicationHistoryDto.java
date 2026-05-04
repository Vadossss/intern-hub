package com.diplom.internhubbackend.dto;

import java.time.LocalDateTime;

public record CandidateApplicationHistoryDto(
        Long applicationId,
        String vacancyPublicId,
        String vacancyTitle,
        String companyName,
        String status,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt
) {
}
