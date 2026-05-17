package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.CandidateApplicationHistoryDto;
import com.diplom.internhubbackend.dto.CandidateProfileResponseDto;
import com.diplom.internhubbackend.dto.CandidateProfileUpdateDto;
import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.CandidateResumeUpsertDto;
import com.diplom.internhubbackend.dto.CandidateResumeViewStatsDto;
import com.diplom.internhubbackend.dto.PageResponse;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.CandidateProfileService;
import com.diplom.internhubbackend.services.CandidateResumeService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class UserProfileController {

    private final CandidateProfileService candidateProfileService;
    private final CandidateResumeService candidateResumeService;

    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public CandidateProfileResponseDto uploadMyProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam("file") MultipartFile file
    ) {
        return candidateProfileService.uploadProfilePhoto(customUserDetails.getUser(), file);
    }

    @Operation(summary = "Получить профиль кандидата текущего пользователя")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/profile")
    public CandidateProfileResponseDto getMyProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        return candidateProfileService.getProfile(customUserDetails.getUser());
    }

    @Operation(summary = "Обновить профиль кандидата текущего пользователя")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @PutMapping("/profile")
    public CandidateProfileResponseDto updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody CandidateProfileUpdateDto request
    ) {
        return candidateProfileService.updateProfile(customUserDetails.getUser(), request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/resumes")
    public List<CandidateResumeResponseDto> getMyResumes(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        return candidateResumeService.getMyResumes(customUserDetails.getUser());
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping("/resumes")
    public CandidateResumeResponseDto createMyResume(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody CandidateResumeUpsertDto request
    ) {
        return candidateResumeService.createResume(customUserDetails.getUser(), request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @PutMapping("/resumes/{resume_id}")
    public CandidateResumeResponseDto updateMyResume(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "resume_id") Long resumeId,
            @RequestBody CandidateResumeUpsertDto request
    ) {
        return candidateResumeService.updateResume(customUserDetails.getUser(), resumeId, request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @PatchMapping("/resumes/{resume_id}/archive")
    public CandidateResumeResponseDto archiveMyResume(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "resume_id") Long resumeId
    ) {
        return candidateResumeService.archiveResume(customUserDetails.getUser(), resumeId);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @PatchMapping("/resumes/{resume_id}/restore")
    public CandidateResumeResponseDto restoreMyResume(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "resume_id") Long resumeId
    ) {
        return candidateResumeService.restoreResume(customUserDetails.getUser(), resumeId);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @DeleteMapping("/resumes/{resume_id}")
    public void deleteMyResume(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "resume_id") Long resumeId
    ) {
        candidateResumeService.deleteResume(customUserDetails.getUser(), resumeId);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/resumes/{resume_id}/view-stats")
    public CandidateResumeViewStatsDto getResumeViewStats(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "resume_id") Long resumeId,
            @RequestParam(defaultValue = "30") int days
    ) {
        return candidateResumeService.getResumeViewStats(customUserDetails.getUser(), resumeId, days);
    }

    @Operation(summary = "Получить историю откликов текущего пользователя")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/applications/history")
    public PageResponse<CandidateApplicationHistoryDto> getMyApplicationHistory(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<CandidateApplicationHistoryDto> results = candidateProfileService.getApplicationHistory(
                customUserDetails.getUser(),
                org.springframework.data.domain.PageRequest.of(page, size)
        );

        return PageResponse.of(
                results.getContent(),
                results.getNumber(),
                results.getSize(),
                results.getTotalElements()
        );
    }

}
