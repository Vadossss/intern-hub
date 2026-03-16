package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.FavoriteVacancy;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.repositories.FavoriteVacancyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;

@RequiredArgsConstructor
@Service
@Slf4j
public class FavoriteVacancyService {
    private final FavoriteVacancyRepository favoriteVacancyRepository;
    private final VacancyService vacancyService;

    public void addFavoriteVacancy(User user, String publicVacancyId) {
        Vacancy vacancy = vacancyService.getVacancy(publicVacancyId);
        log.info("Adding favorite vacancy {} for user {}", publicVacancyId, user.getId());

        favoriteVacancyRepository.save(
                FavoriteVacancy.builder()
                        .vacancy(vacancy)
                        .user(user)
                        .build()
        );
    }

    @Transactional
    public void removeFavoriteVacancy(User user, String publicVacancyId) {
        favoriteVacancyRepository.deleteByUserAndVacancyPublicId(user, publicVacancyId);
    }
}
