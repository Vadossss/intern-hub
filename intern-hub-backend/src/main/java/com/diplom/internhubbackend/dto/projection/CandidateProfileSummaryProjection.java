package com.diplom.internhubbackend.dto.projection;

import java.time.LocalDate;

public record CandidateProfileSummaryProjection(
        Long profileId,
        Integer userId,
        String email,
        String phoneNumber,
        String firstName,
        String lastName,
        LocalDate birthday,
        String avatarUrl,
        Boolean openToWork
) {
}
