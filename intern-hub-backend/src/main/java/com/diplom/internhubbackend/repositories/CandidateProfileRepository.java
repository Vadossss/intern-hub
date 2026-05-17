package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.dto.projection.CandidateProfileSummaryProjection;
import com.diplom.internhubbackend.models.CandidateProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    Optional<CandidateProfile> findByUserId(Integer userId);

    @Query(
            value = """
                    SELECT new com.diplom.internhubbackend.dto.projection.CandidateProfileSummaryProjection(
                        cp.id,
                        u.id,
                        u.email,
                        u.phoneNumber,
                        cp.firstName,
                        cp.lastName,
                        cp.birthday,
                        u.avatarUrl,
                        cp.openToWork
                    )
                    FROM CandidateProfile cp
                    JOIN cp.user u
                    WHERE u.role.id = 'ROLE_USER'
                      AND u.status = :status
                      AND EXISTS (
                            SELECT activeResume.id
                            FROM CandidateResume activeResume
                            WHERE activeResume.candidateProfile = cp
                              AND (activeResume.archived IS NULL OR activeResume.archived = false)
                      )
                      AND (
                            :openToWork IS NULL
                            OR cp.openToWork = :openToWork
                      )
                      AND (
                            :cityPattern IS NULL
                            OR LOWER(cp.city) LIKE :cityPattern
                      )
                      AND (
                            :searchPattern IS NULL
                            OR LOWER(cp.firstName) LIKE :searchPattern
                            OR LOWER(cp.lastName) LIKE :searchPattern
                            OR LOWER(cp.city) LIKE :searchPattern
                            OR LOWER(u.email) LIKE :searchPattern
                            OR LOWER(u.phoneNumber) LIKE :searchPattern
                            OR EXISTS (
                                SELECT resume.id
                                FROM CandidateResume resume
                                WHERE resume.candidateProfile = cp
                                  AND (resume.archived IS NULL OR resume.archived = false)
                                  AND (
                                        LOWER(resume.profession) LIKE :searchPattern
                                        OR LOWER(resume.about) LIKE :searchPattern
                                  )
                            )
                            OR EXISTS (
                                SELECT resumeSkill.id
                                FROM CandidateResume skillResume
                                JOIN skillResume.skills resumeSkill
                                WHERE skillResume.candidateProfile = cp
                                  AND (skillResume.archived IS NULL OR skillResume.archived = false)
                                  AND LOWER(resumeSkill.name) LIKE :searchPattern
                            )
                      )
                      AND (
                            :skillIdsEmpty = TRUE
                            OR EXISTS (
                                SELECT filterResumeSkill.id
                                FROM CandidateResume filterResume
                                JOIN filterResume.skills filterResumeSkill
                                WHERE filterResume.candidateProfile = cp
                                  AND (filterResume.archived IS NULL OR filterResume.archived = false)
                                  AND filterResumeSkill.id IN :skillIds
                            )
                      )
                    ORDER BY COALESCE(cp.updatedAt, cp.createdAt) DESC
                    """,
            countQuery = """
                    SELECT COUNT(cp) FROM CandidateProfile cp
                    JOIN cp.user u
                    WHERE u.role.id = 'ROLE_USER'
                      AND u.status = :status
                      AND EXISTS (
                            SELECT activeResume.id
                            FROM CandidateResume activeResume
                            WHERE activeResume.candidateProfile = cp
                              AND (activeResume.archived IS NULL OR activeResume.archived = false)
                      )
                      AND (
                            :openToWork IS NULL
                            OR cp.openToWork = :openToWork
                      )
                      AND (
                            :cityPattern IS NULL
                            OR LOWER(cp.city) LIKE :cityPattern
                      )
                      AND (
                            :searchPattern IS NULL
                            OR LOWER(cp.firstName) LIKE :searchPattern
                            OR LOWER(cp.lastName) LIKE :searchPattern
                            OR LOWER(cp.city) LIKE :searchPattern
                            OR LOWER(u.email) LIKE :searchPattern
                            OR LOWER(u.phoneNumber) LIKE :searchPattern
                            OR EXISTS (
                                SELECT resume.id
                                FROM CandidateResume resume
                                WHERE resume.candidateProfile = cp
                                  AND (resume.archived IS NULL OR resume.archived = false)
                                  AND (
                                        LOWER(resume.profession) LIKE :searchPattern
                                        OR LOWER(resume.about) LIKE :searchPattern
                                  )
                            )
                            OR EXISTS (
                                SELECT resumeSkill.id
                                FROM CandidateResume skillResume
                                JOIN skillResume.skills resumeSkill
                                WHERE skillResume.candidateProfile = cp
                                  AND (skillResume.archived IS NULL OR skillResume.archived = false)
                                  AND LOWER(resumeSkill.name) LIKE :searchPattern
                            )
                      )
                      AND (
                            :skillIdsEmpty = TRUE
                            OR EXISTS (
                                SELECT filterResumeSkill.id
                                FROM CandidateResume filterResume
                                JOIN filterResume.skills filterResumeSkill
                                WHERE filterResume.candidateProfile = cp
                                  AND (filterResume.archived IS NULL OR filterResume.archived = false)
                                  AND filterResumeSkill.id IN :skillIds
                            )
                      )
                    """
    )
    Page<CandidateProfileSummaryProjection> searchCandidates(
            @Param("searchPattern") String searchPattern,
            @Param("cityPattern") String cityPattern,
            @Param("openToWork") Boolean openToWork,
            @Param("skillIds") Set<Integer> skillIds,
            @Param("skillIdsEmpty") boolean skillIdsEmpty,
            @Param("status") AccountStatus status,
            Pageable pageable
    );
}
