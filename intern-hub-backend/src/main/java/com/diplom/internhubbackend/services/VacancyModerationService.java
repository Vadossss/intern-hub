package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VacancyModerationService {

    private final VacancyRepository vacancyRepository;
    private final VacancyMapper vacancyMapper;


    public Page<VacancyResponseDto> getPendingVacancies(Pageable pageable) {
        List<Vacancy> vacancies = vacancyRepository.findAllByStatus(VacancyStatus.PENDING);

        if (vacancies == null || vacancies.isEmpty()) {
            return new PageImpl<>(new ArrayList<>());
        }

        List<VacancyResponseDto> vacancyResult = vacancyMapper.toDto(vacancies);

        int startIndex = pageable.getPageNumber() * pageable.getPageSize();

        if (vacancyResult == null || vacancyResult.isEmpty() || vacancyResult.size() <= startIndex) {
            return new PageImpl<>(new ArrayList<>());
        }

        List<VacancyResponseDto> result = vacancyResult.subList(
                startIndex, Math.min(startIndex + pageable.getPageSize(), vacancyResult.size())
        );

        return new PageImpl<>(result, pageable, vacancyResult.size());
    }

    @Transactional
    public void approve(String vacancyId) {
        vacancyRepository.approve(vacancyId).orElseThrow(() -> new VacancyNotFoundException("Error"));
    }

    @Transactional
    public void reject(String vacancyId) {
        vacancyRepository.reject(vacancyId).orElseThrow(() -> new VacancyNotFoundException("Error"));
    }
}
