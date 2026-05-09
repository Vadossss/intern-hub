package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.VacancyExcludedWordResponseDto;
import com.diplom.internhubbackend.dto.VacancyExcludedWordUpsertDto;
import com.diplom.internhubbackend.exception.ExcludedWordException;
import com.diplom.internhubbackend.models.VacancyExcludedWord;
import com.diplom.internhubbackend.repositories.VacancyExcludedWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class VacancyExcludedWordService {

    private final VacancyExcludedWordRepository vacancyExcludedWordRepository;

    @Transactional
    public List<VacancyExcludedWordResponseDto> getAllWords() {
        return vacancyExcludedWordRepository.findAllByOrderByWordAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<String> getActiveWords() {
        return vacancyExcludedWordRepository.findAllByActiveTrueOrderByWordAsc().stream()
                .map(VacancyExcludedWord::getWord)
                .toList();
    }

    @Transactional
    public VacancyExcludedWordResponseDto createWord(VacancyExcludedWordUpsertDto request) {
        String word = normalizeWord(request.word());
        Boolean active = request.active() == null || request.active();

        VacancyExcludedWord excludedWord = vacancyExcludedWordRepository.findByWord(word)
                .map(existing -> {
                    existing.setActive(active);
                    existing.setUpdatedAt(LocalDateTime.now());
                    return existing;
                })
                .orElseGet(() -> VacancyExcludedWord.builder()
                        .word(word)
                        .active(active)
                        .createdAt(LocalDateTime.now())
                        .build());

        return toDto(vacancyExcludedWordRepository.save(excludedWord));
    }

    @Transactional
    public VacancyExcludedWordResponseDto updateWord(Long id, VacancyExcludedWordUpsertDto request) {
        VacancyExcludedWord excludedWord = vacancyExcludedWordRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Excluded word not found"));

        if (request.word() != null && !request.word().isBlank()) {
            String word = normalizeWord(request.word());
            vacancyExcludedWordRepository.findByWord(word)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(BAD_REQUEST, "Excluded word already exists");
                    });
            excludedWord.setWord(word);
        }

        if (request.active() != null) {
            excludedWord.setActive(request.active());
        }

        excludedWord.setUpdatedAt(LocalDateTime.now());
        return toDto(vacancyExcludedWordRepository.save(excludedWord));
    }

    @Transactional
    public void deleteWord(Long id) {
        if (!vacancyExcludedWordRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Excluded word not found");
        }

        vacancyExcludedWordRepository.deleteById(id);
    }

    private String normalizeWord(String word) {
        if (word == null || word.isBlank()) {
            throw new ExcludedWordException("Excluded word must not be empty");
        }

        return word.trim().toLowerCase(Locale.ROOT);
    }

    private VacancyExcludedWordResponseDto toDto(VacancyExcludedWord excludedWord) {
        return new VacancyExcludedWordResponseDto(
                excludedWord.getId(),
                excludedWord.getWord(),
                excludedWord.getActive()
        );
    }
}
