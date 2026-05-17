package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.AdminVacancyCreateDto;
import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.services.VacancyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/vacancies")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminVacancyController {

    private final VacancyService vacancyService;

    @PostMapping
    public VacancyResponseDto createVacancy(@RequestBody AdminVacancyCreateDto request) {
        return vacancyService.createAdminVacancy(request);
    }
}
