package com.diplom.internhubbackend.dto;

public record VacancySourceResponseDto(
        Short id,
        String code,
        String name,
        boolean active,
        boolean visible,
        String baseUrl,
        Integer ttlDays,
        long vacanciesCount
) {
}
