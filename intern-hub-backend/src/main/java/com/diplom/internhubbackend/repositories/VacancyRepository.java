package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    @Query("SELECT v FROM Vacancy v WHERE v.stack = :stack")
    List<Vacancy> findByStack(Stack stack);

    @Query("SELECT v FROM Vacancy v WHERE lower(v.publicId) = :publicId")
    Optional<Vacancy> findByPublicId(String publicId);

    @Query("SELECT v FROM Vacancy v WHERE v.publicId = :publicId and v.status in ('APPROVED', 'PENDING')")
    Optional<Vacancy> findActiveVacancyByPublicId(String publicId);

    @Query("SELECT v FROM Vacancy v JOIN v.source as s WHERE s.code = :sourceCode AND v.externalId = :externalId")
    Optional<Vacancy> findBySourceCodeAndExternalId(String externalId, String sourceCode);

    Optional<Vacancy> findByPublicIdAndEmployerId(String publicId, Integer employerId);

    @Query("SELECT v FROM Vacancy v JOIN FavoriteVacancy fv on fv.vacancy = v WHERE fv.user = :user")
    Optional<List<Vacancy>> findAllFavoriteVacancies(User user);

    @Modifying
    @Query("""
        UPDATE Vacancy v SET v.status = 'ARCHIVED'
        WHERE v.expiresAt < :dateTimeNow and v.status = 'APPROVED' and v.isAggregated = true
        """)
    int archiveVacancies(LocalDateTime dateTimeNow);


    @Modifying
    @Query("""
        DELETE FROM Vacancy v WHERE v.status = 'ARCHIVED'
        and v.isAggregated = true and v.expiresAt < :dateTime
        """)
    int deleteOldVacancies(LocalDateTime dateTime);

    @Modifying
    @Query("""
        UPDATE Vacancy v SET v.status = 'APPROVED'
        WHERE v.publicId = :vacancyId and v.status = 'PENDING'
        """)
    Optional<Void> approve(String vacancyId);

    @Modifying
    @Query("""
        UPDATE Vacancy v SET v.status = 'REJECTED'
        WHERE v.publicId = :vacancyId and (v.status = 'PENDING' or v.status = 'APPROVED')
        """)
    Optional<Void> reject(String vacancyId);

    List<Vacancy> findAllByStatus(VacancyStatus status);

    Page<Vacancy> findBySource_CodeAndIsAggregatedTrue(String sourceCode, Pageable pageable);

    Page<Vacancy> findBySource_CodeAndIsAggregatedTrueAndStack_IdIgnoreCase(
            String sourceCode,
            String stackId,
            Pageable pageable
    );

    Page<Vacancy> findAllByEmployerIdOrderByCreatedAtDesc(Integer employerId, Pageable pageable);

    @Query("""
        SELECT DISTINCT v.city FROM Vacancy v
        WHERE v.status in :statuses and v.city is not null and trim(v.city) <> ''
        ORDER BY v.city
        """)
    List<String> findActiveVacancyCities(@Param("statuses") List<VacancyStatus> statuses);

    @Query("""
        SELECT DISTINCT COALESCE(ep.companyName, e.companyName) FROM Vacancy v
        JOIN v.employer e
        LEFT JOIN EmployerProfile ep ON ep.user = e
        WHERE v.status in :statuses
          and COALESCE(ep.companyName, e.companyName) is not null
          and trim(COALESCE(ep.companyName, e.companyName)) <> ''
        ORDER BY COALESCE(ep.companyName, e.companyName)
        """)
    List<String> findActiveVacancyCompanies(@Param("statuses") List<VacancyStatus> statuses);

    @Query("""
        SELECT DISTINCT v.source FROM Vacancy v
        WHERE v.status in :statuses and v.source is not null
        ORDER BY v.source.name
        """)
    List<VacancySource> findActiveVacancySources(@Param("statuses") List<VacancyStatus> statuses);
}
