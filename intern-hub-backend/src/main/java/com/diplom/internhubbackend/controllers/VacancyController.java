package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.*;
import com.diplom.internhubbackend.enums.*;
import com.diplom.internhubbackend.mapper.FilterParamsMapper;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.VacancyService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/vacancies")
@RequiredArgsConstructor
public class VacancyController {

    private final VacancyService vacancyService;
    private final VacancyMapper vacancyMapper;
    private final FilterParamsMapper filterParamsMapper;

    @Operation(summary = "Создание вакансии")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    @PostMapping()
    public ResponseEntity<Object> createInternship(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody NewVacancyDto vacancyRequest
    ) {
        return vacancyService.createVacancy(customUserDetails.getUser(), vacancyRequest);
    }

    @Operation(summary = "Удаление вакансии")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    @DeleteMapping("/{vacancy_id}")
    public void deleteVacancy(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String vacancyId
    ) {
        vacancyService.deleteVacancy(customUserDetails.getUser(), vacancyId);
    }

    @Operation(summary = "Получение вакансии по id")
    @GetMapping("/{vacancy_id}")
    public ResponseEntity<Object> getVacancy(@PathVariable(name = "vacancy_id") String vacancyId) {
        return ResponseEntity.ok(vacancyMapper.toDto(vacancyService.getVacancy(vacancyId)));
    }

    @Operation(summary = "Архивирование вакансии")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    @PatchMapping("/{vacancy_id}/archive")
    public void archiveVacancy(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String vacancyId
    ) {
        vacancyService.archiveVacancy(customUserDetails.getUser(), vacancyId);
    }

    @Operation(summary = "Получение избранных вакансий пользователя")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/favorites")
    public ResponseEntity<PageResponse<VacancyResponseDto>> getFavoriteVacancies(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10", name = "page_size") int pageSize
    ) {
        Page<VacancyResponseDto> results = vacancyService
                .getFavoritesVacancies(customUserDetails.getUser(), page, pageSize);
        return ResponseEntity.ok(
                PageResponse.of(
                    results.getContent(),
                    results.getNumber(),
                    results.getSize(),
                    results.getTotalElements()
        ));
    }

    @Operation(summary = "Получение доступных значений фильтров вакансий")
    @GetMapping("/filters")
    public ResponseEntity<VacancyFilterOptionsDto> getFilterOptions() {
        return ResponseEntity.ok(vacancyService.getActiveFilterOptions());
    }

    @Operation(summary = "Расширенный поиск вакансий")
    @GetMapping
    public ResponseEntity<PageResponse<VacancyResponseDto>> searchVacancies(
            @RequestParam(required = false) List<VacancySourceCode> source,
            @RequestParam(required = false) PositionsEnum position,
            @RequestParam(required = false) List<String> direction,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String employerId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long salaryMin,
            @RequestParam(required = false) Long salaryMax,
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) List<WorkFormatEnum> workFormats,
            @RequestParam(required = false) List<EmploymentEnum> employment,
            @RequestParam(required = false) List<ExperienceEnum> experience,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false, defaultValue = "title") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection) {

        FilterParamsRequest filterParams = new FilterParamsRequest();
        filterParams.setSource(source);
        filterParams.setPosition(position);
        filterParams.setDirection(direction);
        filterParams.setCity(city);
        filterParams.setCompanyName(companyName);
        filterParams.setEmployerId(employerId);
        filterParams.setEmployment(employment);
        filterParams.setExperience(experience);
        filterParams.setSalaryMin(salaryMin);
        filterParams.setSalaryMax(salaryMax);
        filterParams.setSearchText(searchText);
        filterParams.setWorkFormats(workFormats);
        filterParams.setPage(normalizePage(page));
        filterParams.setSize(normalizeSize(size)    );
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

    private int normalizePage(Integer page) {
        return page == null || page < 0 ? 0 : page;
    }

    private int normalizeSize(Integer size) {
        return size == null || size < 1 ? 20 : Math.min(size, 100);
    }

}
