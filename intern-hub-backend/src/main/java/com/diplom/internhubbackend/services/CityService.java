package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.CitySuggestionDto;
import com.diplom.internhubbackend.repositories.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityService {
    private static final int DEFAULT_LIMIT = 8;
    private static final int MAX_LIMIT = 20;

    private final CityRepository cityRepository;

    public List<CitySuggestionDto> suggestCities(String query, Integer limit) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase();
        if (normalizedQuery.isEmpty()) {
            return List.of();
        }

        int normalizedLimit = limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));
        return cityRepository.findSuggestions(normalizedQuery + "%", PageRequest.of(0, normalizedLimit));
    }
}
