package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.FavoriteVacancyService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me/favorite-vacancies")
public class FavoriteVacancyController {

    private final FavoriteVacancyService favoriteVacancyService;

    @Operation(summary = "Добавить вакансию в избранное")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{vacancy_id}")
    public void addFavoriteVacancy(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String publicVacancyId
    ) {
        favoriteVacancyService.addFavoriteVacancy(customUserDetails.getUser(), publicVacancyId);
    }

    @Operation(summary = "Удалить вакансию из избранного")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{vacancy_id}")
    public void removeFavoriteVacancy(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable(name = "vacancy_id") String publicVacancyId
    ) {
        favoriteVacancyService.removeFavoriteVacancy(customUserDetails.getUser(), publicVacancyId);
    }
}
