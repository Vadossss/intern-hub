package com.diplom.internhubbackend.dto;

import java.time.LocalDateTime;

public record EmployerApplicationResponseDto(
        Long applicationId,
        String vacancyPublicId,
        Integer candidateId,
        String candidateName,
        String candidateEmail,
        String status,
        String coverLetter,
        String resumeUrl,
        String chosenContactMethod,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
