package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.VacancySourceResponseDto;
import com.diplom.internhubbackend.dto.VacancySourceUpsertDto;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.repositories.EmployerSourceRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import com.diplom.internhubbackend.repositories.VacancySourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Slf4j
@RequiredArgsConstructor
public class VacancySourceService {
    private final VacancySourceRepository vacancySourceRepository;
    private final VacancyRepository vacancyRepository;
    private final EmployerSourceRepository employerSourceRepository;

    @Cacheable(value = "vacancySource", key = "#vacancySourceCode")
    public VacancySource getVacancySourceByCode(String vacancySourceCode) {
        return vacancySourceRepository.findByCode(vacancySourceCode).orElse(null);
    }

    public List<VacancySource> getAllVacancySourcesByCode(List<String> vacancySourceCodes) {
        return vacancySourceRepository.findAllByCodeIn(vacancySourceCodes);
    }

    @Transactional(readOnly = true)
    public List<VacancySourceResponseDto> getAdminSources() {
        return vacancySourceRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    @CacheEvict(value = {"vacancySource", "vacancy_recommendations_default"}, allEntries = true)
    public VacancySourceResponseDto createSource(VacancySourceUpsertDto request) {
        String code = normalizeCode(request.code());
        if (vacancySourceRepository.existsByCode(code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacancy source code already exists");
        }

        VacancySource source = new VacancySource();
        source.setCode(code);
        source.setName(normalizeName(request.name()));
        source.setActive(request.active() == null || request.active());
        source.setVisible(request.visible() == null || request.visible());
        source.setBaseUrl(normalizeBaseUrl(request.baseUrl()));
        source.setTtlDays(normalizeTtlDays(request.ttlDays()));

        return toDto(vacancySourceRepository.save(source));
    }

    @Transactional
    @CacheEvict(value = {"vacancySource", "vacancy_recommendations_default"}, allEntries = true)
    public VacancySourceResponseDto updateSource(Short sourceId, VacancySourceUpsertDto request) {
        VacancySource source = vacancySourceRepository.findById(sourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vacancy source not found"));

        if (request.code() != null && !request.code().isBlank()) {
            String code = normalizeCode(request.code());
            vacancySourceRepository.findByCode(code)
                    .filter(existing -> !existing.getId().equals(sourceId))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacancy source code already exists");
                    });
            source.setCode(code);
        }

        if (request.name() != null && !request.name().isBlank()) {
            source.setName(normalizeName(request.name()));
        }

        if (request.active() != null) {
            source.setActive(request.active());
        }

        if (request.visible() != null) {
            source.setVisible(request.visible());
        }

        if (request.baseUrl() != null) {
            source.setBaseUrl(normalizeBaseUrl(request.baseUrl()));
        }

        if (request.ttlDays() != null) {
            source.setTtlDays(normalizeTtlDays(request.ttlDays()));
        }

        return toDto(vacancySourceRepository.save(source));
    }

    @Transactional
    @CacheEvict(value = {"vacancySource", "vacancy_recommendations_default"}, allEntries = true)
    public void deleteSource(Short sourceId) {
        VacancySource source = vacancySourceRepository.findById(sourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vacancy source not found"));

        if (vacancyRepository.countBySource_Id(sourceId) > 0 || employerSourceRepository.existsBySource_Id(sourceId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vacancy source is used by vacancies or employers"
            );
        }

        vacancySourceRepository.delete(source);
    }

    private VacancySourceResponseDto toDto(VacancySource source) {
        return new VacancySourceResponseDto(
                source.getId(),
                source.getCode(),
                source.getName(),
                source.isActive(),
                source.isVisible(),
                source.getBaseUrl(),
                source.getTtlDays(),
                vacancyRepository.countBySource_Id(source.getId())
        );
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacancy source code must not be empty");
        }

        String normalized = code.trim().toUpperCase(Locale.ROOT);
        if (!normalized.matches("[A-Z0-9_-]{2,32}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vacancy source code must contain 2-32 latin letters, digits, _ or -"
            );
        }

        return normalized;
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacancy source name must not be empty");
        }

        return name.trim();
    }

    private String normalizeBaseUrl(String baseUrl) {
        return baseUrl == null ? "" : baseUrl.trim();
    }

    private Integer normalizeTtlDays(Integer ttlDays) {
        if (ttlDays == null) {
            return 3;
        }

        if (ttlDays < 1 || ttlDays > 3650) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacancy source ttlDays must be between 1 and 3650");
        }

        return ttlDays;
    }
}
