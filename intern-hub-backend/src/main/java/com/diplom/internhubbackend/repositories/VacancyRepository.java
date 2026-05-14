package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.dto.projection.VacancyProjection;
import com.diplom.internhubbackend.dto.projection.VacancyListProjection;
import com.diplom.internhubbackend.dto.projection.VacancySkillProjection;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.dto.VacancyContactDto;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    @Query("SELECT v FROM Vacancy v WHERE lower(v.publicId) = :publicId")
    Optional<Vacancy> findByPublicId(String publicId);

    @Query("""
        SELECT new com.diplom.internhubbackend.dto.projection.VacancyProjection(
            v.id,
            v.publicId,
            v.title,
            d.id,
            d.name,
            v.description,
            v.city,
            v.status,
            v.salaryFrom,
            v.salaryTo,
            c,
            emp,
            exp,
            wf,
            e.id,
            ep.companyName,
            ep.city,
            COALESCE(ep.avatarUrl, e.avatarUrl),
            ep.aggregated,
            ep.accredited,
            COALESCE(ep.verified, e.verified),
            e.verificationStatus,
            e.verifiedAt,
            e.createdAt,
            e.updatedAt,
            e.status
        )
        FROM Vacancy v
        LEFT JOIN v.direction d
        LEFT JOIN v.currency c
        LEFT JOIN v.employment emp
        LEFT JOIN v.experience exp
        LEFT JOIN v.workFormat wf
        LEFT JOIN v.employer e
        LEFT JOIN EmployerProfile ep ON ep.user = e
        WHERE v.publicId = :publicId
        """)
    Optional<VacancyProjection> findByPublicIdProjection(@Param("publicId") String publicId);

    @Query("""
        SELECT new com.diplom.internhubbackend.dto.KeySkillDto(s.id, s.name)
        FROM Vacancy v
        JOIN v.skills s
        WHERE v.publicId = :publicId
        ORDER BY s.name
        """)
    List<KeySkillDto> findSkillDtosByPublicId(@Param("publicId") String publicId);

    @Query("""
        SELECT new com.diplom.internhubbackend.dto.projection.VacancySkillProjection(v.id, s.id)
        FROM Vacancy v
        JOIN v.skills s
        WHERE v.id IN :vacancyIds
        """)
    List<VacancySkillProjection> findSkillDtosByVacancyIds(@Param("vacancyIds") List<Integer> vacancyIds);

    @Query("""
        SELECT new com.diplom.internhubbackend.dto.VacancyContactDto(c.method, c.value, c.hint)
        FROM VacancyContact c
        WHERE lower(c.vacancy.publicId) = :publicId
        ORDER BY c.id
        """)
    List<VacancyContactDto> findContactDtosByPublicId(@Param("publicId") String publicId);

    @Query("SELECT v FROM Vacancy v WHERE v.publicId = :publicId and v.status in ('APPROVED', 'PENDING')")
    Optional<Vacancy> findActiveVacancyByPublicId(String publicId);

    @Modifying
    @Query("""
        UPDATE Vacancy v
        SET v.status = 'ARCHIVED', v.updatedAt = :updatedAt
        WHERE lower(v.publicId) = :publicId
          and v.employer.id = :employerId
          and v.status in ('APPROVED', 'PENDING')
        """)
    int archiveByPublicIdAndEmployerId(
            @Param("publicId") String publicId,
            @Param("employerId") Integer employerId,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    @Modifying
    @Query("""
        UPDATE Vacancy v
        SET v.status = 'APPROVED', v.updatedAt = :updatedAt
        WHERE lower(v.publicId) = :publicId
          and v.employer.id = :employerId
          and v.status = 'ARCHIVED'
        """)
    int restoreByPublicIdAndEmployerId(
            @Param("publicId") String publicId,
            @Param("employerId") Integer employerId,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    @Query("""
        SELECT v FROM Vacancy v
        JOIN v.employer e
        WHERE v.publicId = :publicId and v.status = 'APPROVED' and e.status = 'ACTIVE'
        """)
    Optional<Vacancy> findApprovedVacancyByPublicId(String publicId);

    @Query(
            value = """
            SELECT new com.diplom.internhubbackend.dto.projection.VacancyListProjection(
                v.id,
                v.publicId,
                v.title,
                v.city,
                v.status,
                v.salaryFrom,
                v.salaryTo,
                c,
                emp,
                exp,
                wf,
                d.id,
                d.name,
                e.id,
                e.avatarUrl,
                e.verified,
                e.verificationStatus,
                e.verifiedAt,
                e.createdAt,
                e.updatedAt
            )
            FROM Vacancy v
            LEFT JOIN v.currency c
            LEFT JOIN v.employment emp
            LEFT JOIN v.experience exp
            LEFT JOIN v.workFormat wf
            LEFT JOIN v.direction d
            LEFT JOIN v.employer e
            WHERE v.status = :status
            """,
            countQuery = "SELECT COUNT(v) FROM Vacancy v WHERE v.status = :status"
    )
    Page<VacancyListProjection> findModerationVacanciesByStatus(
            @Param("status") VacancyStatus status,
            Pageable pageable
    );

    @Query("SELECT v FROM Vacancy v JOIN v.source as s WHERE s.code = :sourceCode AND v.externalId = :externalId")
    Optional<Vacancy> findBySourceCodeAndExternalId(String externalId, String sourceCode);

    @Query("""
        SELECT v FROM Vacancy v JOIN v.source as s
        WHERE s.code = :sourceCode AND v.externalId IN :externalIds
        """)
    List<Vacancy> findAllBySourceCodeAndExternalIdIn(
            @Param("sourceCode") String sourceCode,
            @Param("externalIds") List<String> externalIds
    );

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Vacancy v
        SET v.expiresAt = :expiresAt, v.updatedAt = :updatedAt
        WHERE v.id IN :ids
        """)
    int updateExpiresAtByIds(
            @Param("ids") List<Integer> ids,
            @Param("expiresAt") LocalDateTime expiresAt,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    Optional<Vacancy> findByPublicIdAndEmployerId(String publicId, Integer employerId);

    List<Vacancy> findAllByPublicIdIn(List<String> publicIds);

    @Query("""
        SELECT v FROM Vacancy v
        JOIN FavoriteVacancy fv on fv.vacancy = v
        JOIN v.employer e
        WHERE fv.user = :user and v.status = 'APPROVED' and e.status = 'ACTIVE'
        """)
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

    Page<Vacancy> findBySource_CodeAndIsAggregatedTrueAndDirection_IdIgnoreCase(
            String sourceCode,
            String directionId,
            Pageable pageable
    );

    Page<Vacancy> findAllByEmployerIdOrderByCreatedAtDesc(Integer employerId, Pageable pageable);

    @Query(
            value = """
            SELECT new com.diplom.internhubbackend.dto.projection.VacancyListProjection(
                v.id,
                v.publicId,
                v.title,
                v.city,
                v.status,
                v.salaryFrom,
                v.salaryTo,
                c,
                emp,
                exp,
                wf,
                d.id,
                d.name,
                e.id,
                e.avatarUrl,
                e.verified,
                e.verificationStatus,
                e.verifiedAt,
                e.createdAt,
                e.updatedAt
            )
            FROM Vacancy v
            LEFT JOIN v.currency c
            LEFT JOIN v.employment emp
            LEFT JOIN v.experience exp
            LEFT JOIN v.workFormat wf
            LEFT JOIN v.direction d
            LEFT JOIN v.employer e
            WHERE e.id = :employerId
            ORDER BY v.createdAt DESC
            """,
            countQuery = "SELECT COUNT(v) FROM Vacancy v WHERE v.employer.id = :employerId"
    )
    Page<VacancyListProjection> findEmployerVacancyListByEmployerId(
            @Param("employerId") Integer employerId,
            Pageable pageable
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.VacancyListProjection(
                v.id,
                v.publicId,
                v.title,
                v.city,
                v.status,
                v.salaryFrom,
                v.salaryTo,
                c,
                emp,
                exp,
                wf,
                d.id,
                d.name,
                e.id,
                e.avatarUrl,
                e.verified,
                e.verificationStatus,
                e.verifiedAt,
                e.createdAt,
                e.updatedAt
            )
            FROM Vacancy v
            LEFT JOIN v.currency c
            LEFT JOIN v.employment emp
            LEFT JOIN v.experience exp
            LEFT JOIN v.workFormat wf
            LEFT JOIN v.direction d
            LEFT JOIN v.employer e
            WHERE lower(v.publicId) = :publicId
              AND e.id = :employerId
            """)
    Optional<VacancyListProjection> findEmployerVacancyListByPublicIdAndEmployerId(
            @Param("publicId") String publicId,
            @Param("employerId") Integer employerId
    );

    @Query("""
        SELECT DISTINCT v.city FROM Vacancy v
        JOIN v.employer e
        WHERE v.status in :statuses
          and e.status = 'ACTIVE'
          and v.city is not null
          and trim(v.city) <> ''
        ORDER BY v.city
        """)
    List<String> findActiveVacancyCities(@Param("statuses") List<VacancyStatus> statuses);

    @Query("""
        SELECT DISTINCT ep.companyName FROM Vacancy v
        JOIN v.employer e
        LEFT JOIN EmployerProfile ep ON ep.user = e
        WHERE v.status in :statuses
          and e.status = 'ACTIVE'
          and ep.companyName is not null
          and trim(ep.companyName) <> ''
        ORDER BY ep.companyName
        """)
    List<String> findActiveVacancyCompanies(@Param("statuses") List<VacancyStatus> statuses);

    @Query("""
        SELECT DISTINCT v.source FROM Vacancy v
        JOIN v.employer e
        WHERE v.status in :statuses
          and e.status = 'ACTIVE'
          and v.source is not null
        ORDER BY v.source.name
        """)
    List<VacancySource> findActiveVacancySources(@Param("statuses") List<VacancyStatus> statuses);

    @Query("""
        SELECT DISTINCT v.direction FROM Vacancy v
        JOIN v.employer e
        WHERE v.status in :statuses
          and e.status = 'ACTIVE'
          and v.direction is not null
        ORDER BY v.direction.name
        """)
    List<VacancyDirection> findActiveVacancyDirections(@Param("statuses") List<VacancyStatus> statuses);
}
