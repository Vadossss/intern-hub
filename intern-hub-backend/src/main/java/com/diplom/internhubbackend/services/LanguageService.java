package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Language;
import com.diplom.internhubbackend.repositories.LanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageService {
    private final LanguageRepository languageRepository;

    @Cacheable(value = "languages")
    public List<Language> getAllLanguages() {
        return languageRepository.findAllOrdered();
    }

    @Cacheable(value = "language", key = "#languageId")
    public Language getLanguageById(String languageId) {
        return languageRepository.findById(languageId).orElse(null);
    }
}
