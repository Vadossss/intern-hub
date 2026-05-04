package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.*;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.CandidateProfileService;
import com.diplom.internhubbackend.services.EmployerCabinetService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employer/me")
public class EmployerCabinetController {

    private final EmployerCabinetService employerCabinetService;
    private final CandidateProfileService candidateProfileService;

    @Operation(summary = "Получить вакансии текущего работодателя")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @GetMapping("/vacancies")
    public PageResponse<VacancyResponseDto> getMyVacancies(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<VacancyResponseDto> result = employerCabinetService.getMyVacancies(
                customUserDetails.getUser(),
                page,
                size
        );

        return PageResponse.of(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }

    @Operation(summary = "Обновить вакансию текущего работодателя")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @PutMapping("/vacancies/{vacancy_id}")
    public VacancyResponseDto updateVacancy(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String vacancyId,
            @RequestBody NewVacancyDto request
    ) {
        return employerCabinetService.updateVacancy(customUserDetails.getUser(), vacancyId, request);
    }

    @Operation(summary = "Получить отклики на вакансию текущего работодателя")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @GetMapping("/vacancies/{vacancy_id}/applications")
    public PageResponse<EmployerApplicationResponseDto> getVacancyApplications(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String vacancyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<EmployerApplicationResponseDto> result = employerCabinetService.getVacancyApplications(
                customUserDetails.getUser(),
                vacancyId,
                page,
                size
        );

        return PageResponse.of(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }

    @Operation(summary = "Обновить статус отклика")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @PatchMapping("/applications/{application_id}/status")
    public EmployerApplicationResponseDto updateApplicationStatus(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "application_id") Long applicationId,
            @RequestBody UpdateApplicationStatusRequestDto request
    ) {
        return employerCabinetService.updateApplicationStatus(
                customUserDetails.getUser(),
                applicationId,
                request.getStatus()
        );
    }

    @Operation(summary = "Поиск кандидатов")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @GetMapping("/candidates")
    public PageResponse<CandidateProfileResponseDto> searchCandidates(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false, name = "open_to_work") Boolean openToWork,
            @RequestParam(required = false, name = "skill_ids") Set<Integer> skillIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<CandidateProfileResponseDto> result = employerCabinetService.searchCandidates(
                query,
                city,
                openToWork,
                skillIds,
                page,
                size
        );

        return PageResponse.of(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }

    @Operation(summary = "Получить профиль кандидата по user_id")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @GetMapping("/candidates/{user_id}/profile")
    public CandidateProfileResponseDto getCandidateProfile(@PathVariable(name = "user_id") Integer userId) {
        return candidateProfileService.getProfileByUserId(userId);
    }
}
