package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.CitySuggestionDto;
import com.diplom.internhubbackend.services.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {
    private final CityService cityService;

    @GetMapping("/suggestions")
    public ResponseEntity<List<CitySuggestionDto>> suggestCities(
            @RequestParam String query,
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(cityService.suggestCities(query, limit));
    }
}
