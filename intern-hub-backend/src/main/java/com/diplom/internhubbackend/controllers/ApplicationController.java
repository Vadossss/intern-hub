package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.ApplicationDto;
import com.diplom.internhubbackend.dto.ApplyRequestDto;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vacancies")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Operation(summary = "Создание отклика на вакансию")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{vacancy_id}/apply")
    public ApplicationDto apply(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String publicVacancyId,
            @Valid @RequestBody ApplyRequestDto applyRequestDto
    ) {
        return applicationService.apply(customUserDetails.getUser(), publicVacancyId, applyRequestDto);
    }
}
