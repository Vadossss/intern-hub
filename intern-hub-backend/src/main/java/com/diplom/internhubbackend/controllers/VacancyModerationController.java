package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.PageResponse;
import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.services.VacancyModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/moderation/vacancies")
@RequiredArgsConstructor
public class VacancyModerationController {

    private final VacancyModerationService vacancyModerationService;

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{vacancy_id}/approve")
    public void approve(@PathVariable(name = "vacancy_id") String vacancyId) {
        vacancyModerationService.approve(vacancyId);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{vacancy_id}/reject")
    public void reject(@PathVariable(name = "vacancy_id") String vacancyId) {
        vacancyModerationService.reject(vacancyId);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping()
    public PageResponse<VacancyResponseDto> getVacancy(Pageable pageable) {
        Page<VacancyResponseDto> result = vacancyModerationService.getPendingVacancies(pageable);
        return PageResponse.of(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }
}
