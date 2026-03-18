package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.PositionsEnum;
import com.diplom.internhubbackend.enums.VacancySourceCode;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.enums.WorkFormatEnum;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class FilterParamsRequest {
    @Parameter(description = "Источник вакансии")
    private List<VacancySourceCode> source;

    @Enumerated(EnumType.STRING)
    @Parameter(description = "Позиция/должность")
    private PositionsEnum position;

    @Parameter(description = "Город")
    private String city;

    @Parameter(description = "Название компании")
    private String companyName;

    @Parameter(description = "График работы")
    private String schedule;

    @Parameter(description = "Тип занятости")
    private String employment;

    @Parameter(description = "Минимальная зарплата")
    private Long salaryMin;

    @Parameter(description = "Максимальная зарплата")
    private Long salaryMax;

    @Parameter(description = "Статус вакансии (Активна/На проверке/Архивирована)")
    private VacancyStatus status;

    @Parameter(description = "Текст для полнотекстового поиска")
    private String searchText;

    @Parameter(description = "Формат работы")
    private List<WorkFormatEnum> workFormats;

    @Parameter(description = "Номер страницы (начиная с 0)")
    private Integer page = 0;

    @Parameter(description = "Размер страницы")
    private Integer size = 20;

    @Parameter(description = "Поле для сортировки")
    private String sortBy = "name";

    @Parameter(description = "Направление сортировки (asc/desc)")
    private String sortDirection = "asc";
}
