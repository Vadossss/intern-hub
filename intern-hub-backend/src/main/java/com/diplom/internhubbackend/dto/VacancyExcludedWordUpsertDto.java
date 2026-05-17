package com.diplom.internhubbackend.dto;

public record VacancyExcludedWordUpsertDto(
        String word,
        Boolean active
) {
}
