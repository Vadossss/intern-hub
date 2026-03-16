package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.dto.FilterParamsRequest;
import com.diplom.internhubbackend.dto.FilterParams;
import com.diplom.internhubbackend.services.StackService;
import com.diplom.internhubbackend.services.VacancySourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class FilterParamsMapper {

    private final VacancySourceService vacancySourceService;
    private final StackService stackService;

    public FilterParams toDto(FilterParamsRequest filterParams) {

        List<VacancySource> source = filterParams.getSource() == null || filterParams.getSource().isEmpty() ?
                null :
                vacancySourceService
                        .getAllVacancySourcesByCode(filterParams.getSource()
                                .stream()
                                .map(Enum::name)
                                .collect(Collectors.toList()));

        Stack stack = filterParams.getPosition() == null ?
                null :
                stackService
                        .getStackById(filterParams.getPosition().getFullName().toLowerCase());

        return FilterParams.builder()
                .source(source)
                .stack(stack)
                .city(filterParams.getCity())
                .schedule(filterParams.getSchedule())
                .employment(filterParams.getEmployment())
                .salaryMin(filterParams.getSalaryMin())
                .salaryMax(filterParams.getSalaryMax())
                .status(filterParams.getStatus())
                .searchText(filterParams.getSearchText())
                .workFormats(filterParams.getWorkFormats())
                .page(filterParams.getPage())
                .size(filterParams.getSize())
                .sortBy(filterParams.getSortBy())
                .sortDirection(filterParams.getSortDirection())
                .build();
    }
}
