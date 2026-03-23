package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.dto.FilterParamsRequest;
import com.diplom.internhubbackend.dto.FilterParams;
import com.diplom.internhubbackend.services.*;
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
    private final WorkFormatService workFormatService;
    private final EmploymentService employmentService;
    private final ExperienceService experienceService;

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


        List<WorkFormat> workFormat = filterParams.getWorkFormats() == null || filterParams.getWorkFormats().isEmpty() ?
                null :
                workFormatService
                        .getAllWorkFormatById(filterParams.getWorkFormats()
                                .stream()
                                .map(Enum::name)
                                .collect(Collectors.toList()));

        List<Employment> employment = filterParams.getEmployment() == null || filterParams.getEmployment().isEmpty() ?
                null :
                employmentService
                        .getAllEmploymentsById(filterParams.getEmployment()
                                .stream()
                                .map(Enum::name)
                                .collect(Collectors.toList())
                        );


        List<Experience> experience = filterParams.getExperience() == null || filterParams.getExperience().isEmpty() ?
                null :
                experienceService
                        .getAllExperiencesById(filterParams.getExperience()
                                .stream()
                                .map(Enum::name)
                                .collect(Collectors.toList())
                        );



        return FilterParams.builder()
                .source(source)
                .stack(stack)
                .city(filterParams.getCity())
                .companyName(filterParams.getCompanyName())
                .employment(employment)
                .experience(experience)
                .salaryMin(filterParams.getSalaryMin())
                .salaryMax(filterParams.getSalaryMax())
                .status(filterParams.getStatus())
                .searchText(filterParams.getSearchText())
                .workFormats(workFormat)
                .page(filterParams.getPage())
                .size(filterParams.getSize())
                .sortBy(filterParams.getSortBy())
                .sortDirection(filterParams.getSortDirection())
                .build();
    }
}
