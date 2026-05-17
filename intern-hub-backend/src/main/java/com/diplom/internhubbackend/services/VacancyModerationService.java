package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.dto.projection.VacancyListProjection;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.EmployerProfile;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VacancyModerationService {

    private final VacancyRepository vacancyRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final VacancyMapper vacancyMapper;
    private final ViewTrackingService viewTrackingService;


    public Page<VacancyResponseDto> getPendingVacancies(Pageable pageable) {
        Page<VacancyListProjection> vacancies = vacancyRepository.findModerationVacanciesByStatus(
                VacancyStatus.PENDING,
                pageable
        );

        if (vacancies.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, vacancies.getTotalElements());
        }

        List<VacancyResponseDto> result = vacancyMapper.toListDto(
                vacancies.getContent(),
                getEmployerProfiles(vacancies.getContent())
        );
        viewTrackingService.applyVacancyViewCounts(result);

        return new PageImpl<>(result, pageable, vacancies.getTotalElements());
    }

    private Map<Integer, EmployerProfile> getEmployerProfiles(List<VacancyListProjection> vacancies) {
        List<Integer> employerIds = vacancies.stream()
                .map(VacancyListProjection::employerId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (employerIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return employerProfileRepository.findAllByUserIdIn(employerIds).stream()
                .collect(Collectors.toMap(
                        profile -> profile.getUser().getId(),
                        profile -> profile,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public void approve(String vacancyId) {
        vacancyRepository.approve(vacancyId).orElseThrow(() -> new VacancyNotFoundException("Error"));
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public void reject(String vacancyId) {
        vacancyRepository.reject(vacancyId).orElseThrow(() -> new VacancyNotFoundException("Error"));
    }
}
