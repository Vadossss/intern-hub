package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.dto.CitySuggestionDto;
import com.diplom.internhubbackend.models.City;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    @Query("""
            SELECT new com.diplom.internhubbackend.dto.CitySuggestionDto(c.name, c.regionFullname)
            FROM City c
            WHERE LOWER(c.name) LIKE :pattern
            ORDER BY c.name, c.regionFullname
            """)
    List<CitySuggestionDto> findSuggestions(@Param("pattern") String pattern, Pageable pageable);
}
