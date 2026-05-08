package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.dto.hh.EmployerDto;

import java.time.LocalDateTime;

public record CandidateApplicationHistoryDto(
        Long applicationId,
        String vacancyPublicId,
        String vacancyTitle,
        EmployerDto employer,
        String status,
        Boolean archived,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt
) {
}
