package com.diplom.internhubbackend.dto.projection;

import java.time.LocalDate;

public record CandidateResumeEducationProjection(
        Long resumeId,
        Long id,
        String institution,
        String specialty,
        String educationLevel,
        LocalDate startDate,
        LocalDate endDate,
        Boolean currentlyStudying
) {
}
