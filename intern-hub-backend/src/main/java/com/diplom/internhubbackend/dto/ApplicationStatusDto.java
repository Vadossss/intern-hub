package com.diplom.internhubbackend.dto;

public record ApplicationStatusDto(
        boolean applied,
        Long applicationId,
        String status,
        Long resumeId
) {
}
