package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.ApplicationDto;
import com.diplom.internhubbackend.dto.ApplyRequestDto;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vacancies")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/{publicVacancyId}/apply")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDto apply(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable String publicVacancyId,
            ApplyRequestDto applyRequestDto) {
        return applicationService.apply(customUserDetails.getUser(), publicVacancyId, applyRequestDto);
    }
}
