package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.*;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.CandidateProfileService;
import com.diplom.internhubbackend.services.EmployerCabinetService;
import com.diplom.internhubbackend.services.EmployerProfileService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employer/me")
public class EmployerCabinetController {

    private final EmployerCabinetService employerCabinetService;
    private final CandidateProfileService candidateProfileService;
    private final EmployerProfileService employerProfileService;

    @Operation(summary = "Получить профиль кандидата текущего пользователя")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @GetMapping("/profile")
    public EmployerProfileResponseDto getMyProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        return employerProfileService.getProfile(customUserDetails.getUser());
    }

    @Operation(summary = "Обновить профиль текущего работодателя")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @PutMapping("/profile")
    public EmployerProfileResponseDto updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody EmployerProfileUpdateDto request
    ) {
        return employerProfileService.updateProfile(customUserDetails.getUser(), request);
    }

    @Operation(summary = "Обновить фото профиля работодателя")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EmployerProfileResponseDto uploadMyProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam("file") MultipartFile file
    ) {
        return employerProfileService.uploadProfilePhoto(customUserDetails.getUser(), file);
    }

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
    public PageResponse<CandidateResumeSearchResponseDto> searchCandidates(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false, name = "skill_ids") Set<Integer> skillIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<CandidateResumeSearchResponseDto> result = employerCabinetService.searchCandidates(
                query,
                city,
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
    public CandidateProfileResponseDto getCandidateProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "user_id") Integer userId,
            HttpServletRequest request
    ) {
        CandidateProfileResponseDto profile = candidateProfileService.getProfileByUserId(userId);
        employerCabinetService.recordCandidateProfileView(customUserDetails.getUser(), profile, request);

        return profile;
    }

    @Operation(summary = "Р—Р°С„РёРєСЃРёСЂРѕРІР°С‚СЊ РїСЂРѕСЃРјРѕС‚СЂ СЂРµР·СЋРјРµ")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @PostMapping("/candidates/resumes/{resume_id}/view")
    public void recordCandidateResumeView(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "resume_id") Long resumeId,
            HttpServletRequest request
    ) {
        employerCabinetService.recordCandidateResumeView(customUserDetails.getUser(), resumeId, request);
    }

    @Operation(summary = "Пригласить соискателя в чат по резюме")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    @PostMapping("/candidates/resumes/{resume_id}/invite")
    public ChatRoomResponseDto inviteCandidate(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "resume_id") Long resumeId,
            @RequestBody EmployerInviteCandidateRequestDto request
    ) {
        return employerCabinetService.inviteCandidate(customUserDetails.getUser(), resumeId, request);
    }
}
