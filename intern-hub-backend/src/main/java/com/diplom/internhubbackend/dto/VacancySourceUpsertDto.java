package com.diplom.internhubbackend.dto;

public record VacancySourceUpsertDto(
        String code,
        String name,
        Boolean active,
        Boolean visible,
        String baseUrl,
        Integer ttlDays
) {
}
