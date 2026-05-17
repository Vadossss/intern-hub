package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.VacancySource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VacancySourceRepository extends JpaRepository<VacancySource, Short> {
    Optional<VacancySource> findByCode(String code);

    List<VacancySource> findAllByCodeIn(List<String> codes);

    List<VacancySource> findAllByOrderByNameAsc();

    boolean existsByCode(String code);
}
