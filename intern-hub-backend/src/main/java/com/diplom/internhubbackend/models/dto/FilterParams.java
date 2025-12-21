package com.diplom.internhubbackend.models.dto;

import com.diplom.internhubbackend.models.enums.VacancySource;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterParams {
    @Parameter(description = "Источник вакансии")
    private VacancySource source;

    @Parameter(description = "Позиция/должность")
    private String position;

    @Parameter(description = "Город")
    private String city;

    @Parameter(description = "График работы")
    private String schedule;

    @Parameter(description = "Тип занятости")
    private String employment;

    @Parameter(description = "Минимальная зарплата")
    private String salaryMin;

    @Parameter(description = "Максимальная зарплата")
    private String salaryMax;

    @Parameter(description = "Текст для полнотекстового поиска")
    private String searchText;

    @Parameter(description = "Формат работы")
    private List<String> workFormats;

    @Parameter(description = "Номер страницы (начиная с 0)")
    private Integer page = 0;

    @Parameter(description = "Размер страницы")
    private Integer size = 20;

    @Parameter(description = "Поле для сортировки")
    private String sortBy = "name";

    @Parameter(description = "Направление сортировки (asc/desc)")
    private String sortDirection = "asc";

    // Проверка, есть ли активные фильтры
    public boolean hasFilters() {
        return source != null ||
                (position != null && !position.isBlank()) ||
                (city != null && !city.isBlank()) ||
                (schedule != null && !schedule.isBlank()) ||
                (employment != null && !employment.isBlank()) ||
                (salaryMin != null && !salaryMin.isBlank()) ||
                (salaryMax != null && !salaryMax.isBlank()) ||
                (searchText != null && !searchText.isBlank()) ||
                (workFormats != null && !workFormats.isEmpty());
    }
}
