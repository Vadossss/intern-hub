package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.ApplicationDto;
import com.diplom.internhubbackend.dto.ApplyRequestDto;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/api/vacancies/{publicVacancyId}/apply")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDto apply(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable String publicVacancyId,
            ApplyRequestDto applyRequestDto) {
        return applicationService.apply(customUserDetails.getUser(), publicVacancyId, applyRequestDto);
    }
}
