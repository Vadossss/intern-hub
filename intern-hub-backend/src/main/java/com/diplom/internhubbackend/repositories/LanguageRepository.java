package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LanguageRepository extends JpaRepository<Language, String> {
    @Query("""
            SELECT language FROM Language language
            ORDER BY CASE language.id
                WHEN 'russian' THEN 0
                WHEN 'english' THEN 1
                WHEN 'belarusian' THEN 2
                WHEN 'kazakh' THEN 3
                WHEN 'ukrainian' THEN 4
                WHEN 'armenian' THEN 5
                WHEN 'azerbaijani' THEN 6
                WHEN 'georgian' THEN 7
                WHEN 'kyrgyz' THEN 8
                WHEN 'tajik' THEN 9
                WHEN 'turkmen' THEN 10
                WHEN 'uzbek' THEN 11
                ELSE 100
            END,
            language.name ASC
            """)
    List<Language> findAllOrdered();
}
