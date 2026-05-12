package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.CandidateProfileResponseDto;
import com.diplom.internhubbackend.dto.EmployerProfileResponseDto;
import com.diplom.internhubbackend.dto.PageResponse;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.CandidateProfileService;
import com.diplom.internhubbackend.services.EmployerProfileService;
import com.diplom.internhubbackend.services.ViewTrackingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class PublicProfileController {

    private final EmployerProfileService employerProfileService;
    private final CandidateProfileService candidateProfileService;
    private final ViewTrackingService viewTrackingService;

    @GetMapping("/employers")
    public PageResponse<EmployerProfileResponseDto> getEmployerProfiles(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Page<EmployerProfileResponseDto> result = employerProfileService.searchPublicProfiles(query, page, size);

        return PageResponse.of(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }

    @GetMapping("/employers/{user_id}")
    public EmployerProfileResponseDto getEmployerProfile(
            @PathVariable(name = "user_id") Integer userId
    ) {
        return employerProfileService.getProfileByUserId(userId);
    }

    @GetMapping("/candidates/{user_id}")
    public CandidateProfileResponseDto getCandidateProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "user_id") Integer userId,
            HttpServletRequest request
    ) {
        CandidateProfileResponseDto profile = candidateProfileService.getProfileByUserId(userId);
        viewTrackingService.recordResumeViews(
                profile.getResumes(),
                profile.getUserId(),
                customUserDetails == null ? null : customUserDetails.getUser(),
                request
        );
        viewTrackingService.applyResumeViewCounts(profile.getResumes());

        return profile;
    }
}
