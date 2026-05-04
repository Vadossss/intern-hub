package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.repositories.VacancySourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class VacancySourceService {
    private final VacancySourceRepository vacancySourceRepository;

    @Cacheable(value = "vacancySource", key = "#vacancySourceCode")
    public VacancySource getVacancySourceByCode(String vacancySourceCode) {
        return vacancySourceRepository.findByCode(vacancySourceCode).orElse(null);
    }

    public List<VacancySource> getAllVacancySourcesByCode(List<String> vacancySourceCodes) {
        return vacancySourceRepository.findAllByCodeIn(vacancySourceCodes);
    }
}
