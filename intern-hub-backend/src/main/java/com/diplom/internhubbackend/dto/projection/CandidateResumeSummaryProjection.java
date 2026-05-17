package com.diplom.internhubbackend.dto.projection;

import java.time.LocalDateTime;

public record CandidateResumeSummaryProjection(
        Long profileId,
        Long id,
        String profession,
        String candidateCity,
        Long expectedSalaryFrom,
        Long expectedSalaryTo,
        String employmentId,
        String employmentName,
        String workFormatId,
        String workFormatName,
        String experienceId,
        String experienceName,
        String about,
        Boolean archived,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
