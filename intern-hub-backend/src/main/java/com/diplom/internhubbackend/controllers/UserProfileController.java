package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.CandidateApplicationHistoryDto;
import com.diplom.internhubbackend.dto.CandidateProfileResponseDto;
import com.diplom.internhubbackend.dto.CandidateProfileUpdateDto;
import com.diplom.internhubbackend.dto.PageResponse;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.CandidateProfileService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class UserProfileController {

    private final CandidateProfileService candidateProfileService;

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
