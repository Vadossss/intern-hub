package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.Language;
import com.diplom.internhubbackend.services.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
public class LanguageController {
    private final LanguageService languageService;

    @GetMapping
    public List<Language> getLanguages() {
        return languageService.getAllLanguages();
    }
}
