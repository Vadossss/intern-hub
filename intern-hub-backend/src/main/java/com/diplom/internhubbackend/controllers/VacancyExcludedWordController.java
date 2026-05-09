package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.VacancyExcludedWordResponseDto;
import com.diplom.internhubbackend.dto.VacancyExcludedWordUpsertDto;
import com.diplom.internhubbackend.services.VacancyExcludedWordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/vacancy-excluded-words")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class VacancyExcludedWordController {

    private final VacancyExcludedWordService vacancyExcludedWordService;

    @GetMapping
    public List<VacancyExcludedWordResponseDto> getWords() {
        return vacancyExcludedWordService.getAllWords();
    }

    @PostMapping
    public VacancyExcludedWordResponseDto createWord(@RequestBody VacancyExcludedWordUpsertDto request) {
        return vacancyExcludedWordService.createWord(request);
    }

    @PatchMapping("/{word_id}")
    public VacancyExcludedWordResponseDto updateWord(
            @PathVariable(name = "word_id") Long wordId,
            @RequestBody VacancyExcludedWordUpsertDto request
    ) {
        return vacancyExcludedWordService.updateWord(wordId, request);
    }

    @DeleteMapping("/{word_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWord(@PathVariable(name = "word_id") Long wordId) {
        vacancyExcludedWordService.deleteWord(wordId);
    }
}
