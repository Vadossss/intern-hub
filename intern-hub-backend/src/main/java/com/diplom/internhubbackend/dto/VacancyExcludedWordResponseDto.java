package com.diplom.internhubbackend.dto;

public record VacancyExcludedWordResponseDto(
        Long id,
        String word,
        Boolean active
) {
}
