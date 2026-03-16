package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.*;
import com.diplom.internhubbackend.mapper.FilterParamsMapper;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.enums.PositionsEnum;
import com.diplom.internhubbackend.enums.VacancySourceCode;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.VacancyService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/vacancy")
@RequiredArgsConstructor
public class VacancyController {

    private final VacancyService vacancyService;
    private final VacancyMapper vacancyMapper;
    private final FilterParamsMapper filterParamsMapper;

    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    @PostMapping()
    @Operation(summary = "Создание вакансии")
    public ResponseEntity<Object> createInternship(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody NewVacancyDto vacancyRequest
    ) {
        return vacancyService.createVacancy(customUserDetails.getUser(), vacancyRequest);
    }

    @GetMapping("/{vacancyId}")
    @Operation(summary = "Получение вакансии по id")
    public ResponseEntity<Object> getVacancy(@PathVariable String vacancyId) {
        return ResponseEntity.ok(vacancyMapper.toDto(vacancyService.getVacancy(vacancyId)));
    }

    @GetMapping
    @Operation(summary = "Расширенный поиск вакансий")
    public ResponseEntity<PageResponse<VacancyResponseDto>> searchVacancies(
            @RequestParam(required = false) List<VacancySourceCode> source,
            @RequestParam(required = false) PositionsEnum position,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String schedule,
            @RequestParam(required = false) String employment,
            @RequestParam(required = false) Long salaryMin,
            @RequestParam(required = false) Long salaryMax,
            @RequestParam(required = false) VacancyStatus status,
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) List<String> workFormats,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection) {

        FilterParamsRequest filterParams = new FilterParamsRequest();
        filterParams.setSource(source);
        filterParams.setPosition(position);
        filterParams.setCity(city);
        filterParams.setSchedule(schedule);
        filterParams.setEmployment(employment);
        filterParams.setSalaryMin(salaryMin);
        filterParams.setSalaryMax(salaryMax);
        filterParams.setStatus(status);
        filterParams.setSearchText(searchText);
        filterParams.setWorkFormats(workFormats);
        filterParams.setPage(page);
        filterParams.setSize(size);
        filterParams.setSortBy(sortBy);
        filterParams.setSortDirection(sortDirection);

        Page<VacancyResponseDto> results =
                vacancyService.getVacanciesByParams(filterParamsMapper.toDto(filterParams));


        return ResponseEntity.ok(
                PageResponse.of(
                        results.getContent(),
                        results.getNumber(),
                        results.getSize(),
                        results.getTotalElements()
                )
        );
    }
//
//    @GetMapping("/search/text")
//    @Operation(summary = "Полнотекстовый поиск по всем полям")
//    public ResponseEntity<List<VacancyCache>> fullTextSearch(
//            @RequestParam String query) {
//
//        List<VacancyCache> results = vacanciesCacheService.fullTextSearch(query);
//        return ResponseEntity.ok(results);
//    }
//
//    @GetMapping("/cities")
//    @Operation(summary = "Получить список уникальных городов")
//    public ResponseEntity<List<String>> getCities() {
//        List<String> cities = vacanciesCacheService.getDistinctCities();
//        return ResponseEntity.ok(cities);
//    }
}
