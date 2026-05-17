package com.diplom.internhubbackend.dto.projection;

import java.time.LocalDate;

public record CandidateResumeWorkExperienceProjection(
        Long resumeId,
        Long id,
        String company,
        String position,
        String workFormatId,
        String workFormatName,
        LocalDate startDate,
        LocalDate endDate,
        Boolean currentlyWorking,
        String projectUrl
) {
}
