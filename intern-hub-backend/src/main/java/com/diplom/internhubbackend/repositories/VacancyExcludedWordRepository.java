package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.VacancyExcludedWord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VacancyExcludedWordRepository extends JpaRepository<VacancyExcludedWord, Long> {
    List<VacancyExcludedWord> findAllByOrderByWordAsc();

    List<VacancyExcludedWord> findAllByActiveTrueOrderByWordAsc();

    Optional<VacancyExcludedWord> findByWord(String word);
}
