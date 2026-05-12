package com.diplom.internhubbackend.dto.projection;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CandidateResumeSearchProjection(
        Long profileId,
        Integer userId,
        String email,
        String phoneNumber,
        String firstName,
        String lastName,
        LocalDate birthday,
        String avatarUrl,
        String profileAbout,
        String resumeUrl,
        String portfolioUrl,
        Boolean openToWork,
        Long resumeId,
        String profession,
        String city,
        Long expectedSalaryFrom,
        Long expectedSalaryTo,
        String employmentId,
        String employmentName,
        String workFormatId,
        String workFormatName,
        String experienceId,
        String experienceName,
        String resumeAbout,
        Boolean archived,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
