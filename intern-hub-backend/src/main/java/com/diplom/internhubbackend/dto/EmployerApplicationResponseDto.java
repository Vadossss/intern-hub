package com.diplom.internhubbackend.dto;

import java.time.LocalDateTime;

public record EmployerApplicationResponseDto(
        Long applicationId,
        String vacancyPublicId,
        Integer candidateId,
        String candidateName,
        String candidateEmail,
        String status,
        Boolean archived,
        String coverLetter,
        String resumeUrl,
        Long resumeId,
        String resumeProfession,
        String chosenContactMethod,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String chatId
) {
}
