package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.EmployerSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmployerSourceRepository extends JpaRepository<EmployerSource, Long> {
    Optional<EmployerSource> findBySource_CodeAndExternalId(String sourceCode, String externalId);

    boolean existsBySource_Id(Short sourceId);

    @Query("""
            SELECT es FROM EmployerSource es
            JOIN FETCH es.employerProfile ep
            JOIN FETCH ep.user
            JOIN FETCH es.source s
            WHERE s.code = :sourceCode AND es.externalId = :externalId
            """)
    Optional<EmployerSource> findExistingEmployer(
            @Param("sourceCode") String sourceCode,
            @Param("externalId") String externalId
    );
}
