package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.EmployerSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployerSourceRepository extends JpaRepository<EmployerSource, Long> {
    Optional<EmployerSource> findBySource_CodeAndExternalId(String sourceCode, String externalId);
}
