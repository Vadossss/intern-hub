package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.FavoriteVacancyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorite-vacancy")
public class FavoriteVacancyController {

    private final FavoriteVacancyService favoriteVacancyService;

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping("/{publicVacancyId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void addFavoriteVacancy(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable String publicVacancyId
    ) {
        favoriteVacancyService.addFavoriteVacancy(customUserDetails.getUser(), publicVacancyId);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @DeleteMapping("/{publicVacancyId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavoriteVacancy(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable String publicVacancyId
    ) {
        favoriteVacancyService.removeFavoriteVacancy(customUserDetails.getUser(), publicVacancyId);
    }
}
