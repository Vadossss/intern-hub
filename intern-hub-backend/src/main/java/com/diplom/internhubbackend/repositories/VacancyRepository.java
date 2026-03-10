package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.dto.FilterParams;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    @Query("SELECT v FROM Vacancy v WHERE v.stack = :stack")
    List<Vacancy> findByStack(Stack stack);

    @Query("SELECT v FROM Vacancy v WHERE v.publicId = :publicId")
    Optional<Vacancy> findByPublicIdId(String publicId);

    @Query("SELECT v FROM Vacancy v JOIN v.source as s WHERE s.code = :sourceCode AND v.externalId = :externalId")
    Optional<Vacancy> findBySourceCodeAndExternalId(String externalId, String sourceCode);

    @Modifying
    @Query("""
        UPDATE Vacancy v SET v.status = 'ARCHIVED'
        WHERE v.expiresAt < :dateTimeNow and v.status = 'ACTIVE'
        """)
    int archiveVacancies(LocalDateTime dateTimeNow);

}
