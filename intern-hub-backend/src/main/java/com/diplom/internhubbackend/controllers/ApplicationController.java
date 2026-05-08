package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.ApplicationDto;
import com.diplom.internhubbackend.dto.ApplicationStatusDto;
import com.diplom.internhubbackend.dto.ApplyRequestDto;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vacancies")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Operation(summary = "Создание отклика на вакансию")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping("/{vacancy_id}/apply")
    public ApplicationDto apply(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String publicVacancyId,
            @Valid @RequestBody ApplyRequestDto applyRequestDto
    ) {
        return applicationService.apply(customUserDetails.getUser(), publicVacancyId, applyRequestDto);
    }

    @Operation(summary = "Проверка отклика текущего соискателя на вакансию")
    @GetMapping("/{vacancy_id}/application-status")
    public ApplicationStatusDto getApplicationStatus(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String publicVacancyId
    ) {
        if (customUserDetails == null) {
            return new ApplicationStatusDto(false, null, null, null);
        }

        return applicationService.getApplicationStatus(customUserDetails.getUser(), publicVacancyId);
    }
}
