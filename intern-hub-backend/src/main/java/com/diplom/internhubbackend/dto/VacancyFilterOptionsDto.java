package com.diplom.internhubbackend.dto;

import java.util.List;

public record VacancyFilterOptionsDto(
        List<String> cities,
        List<String> companies,
        List<FilterOptionDto> sources
) {
    public record FilterOptionDto(String id, String name) {
    }
}
