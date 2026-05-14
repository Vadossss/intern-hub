package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSearchProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSkillProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeLanguageProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeEducationProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeWorkExperienceProjection;
import com.diplom.internhubbackend.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface CandidateResumeRepository extends JpaRepository<CandidateResume, Long> {
    List<CandidateResume> findAllByCandidateProfile_User_IdOrderByCreatedAtAsc(Integer userId);

    long countByCandidateProfile_User_Id(Integer userId);

    @Query("""
            SELECT COUNT(resume) FROM CandidateResume resume
            WHERE resume.candidateProfile.user.id = :userId
              AND (resume.archived IS NULL OR resume.archived = false)
            """)
    long countActiveByUserId(@Param("userId") Integer userId);

    Optional<CandidateResume> findByIdAndCandidateProfile_User_Id(Long id, Integer userId);

    @Query("""
            SELECT resume.candidateProfile.user.id
            FROM CandidateResume resume
            WHERE resume.id = :resumeId
            """)
    Optional<Integer> findOwnerUserIdByResumeId(@Param("resumeId") Long resumeId);

    @Query("""
            SELECT resume.archived
            FROM CandidateResume resume
            WHERE resume.id = :resumeId
            """)
    Optional<Boolean> findArchivedByResumeId(@Param("resumeId") Long resumeId);

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection(
                profile.id,
                resume.id,
                resume.profession,
                profile.city,
                resume.expectedSalaryFrom,
                resume.expectedSalaryTo,
                employment.id,
                employment.name,
                workFormat.id,
                workFormat.name,
                experience.id,
                experience.name,
                resume.about,
                resume.archived,
                resume.createdAt,
                resume.updatedAt
            )
            FROM CandidateResume resume
            JOIN resume.candidateProfile profile
            LEFT JOIN resume.employment employment
            LEFT JOIN resume.workFormat workFormat
            LEFT JOIN resume.experience experience
            WHERE profile.id IN :profileIds
              AND (resume.archived IS NULL OR resume.archived = false)
            ORDER BY profile.id, resume.createdAt ASC
            """)
    List<CandidateResumeSummaryProjection> findActiveSummariesByProfileIds(
            @Param("profileIds") List<Long> profileIds
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection(
                profile.id,
                resume.id,
                resume.profession,
                profile.city,
                resume.expectedSalaryFrom,
                resume.expectedSalaryTo,
                employment.id,
                employment.name,
                workFormat.id,
                workFormat.name,
                experience.id,
                experience.name,
                resume.about,
                resume.archived,
                resume.createdAt,
                resume.updatedAt
            )
            FROM CandidateResume resume
            JOIN resume.candidateProfile profile
            LEFT JOIN resume.employment employment
            LEFT JOIN resume.workFormat workFormat
            LEFT JOIN resume.experience experience
            WHERE profile.user.id = :userId
            ORDER BY resume.createdAt ASC
            """)
    List<CandidateResumeSummaryProjection> findSummariesByUserId(
            @Param("userId") Integer userId
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection(
                profile.id,
                resume.id,
                resume.profession,
                profile.city,
                resume.expectedSalaryFrom,
                resume.expectedSalaryTo,
                employment.id,
                employment.name,
                workFormat.id,
                workFormat.name,
                experience.id,
                experience.name,
                resume.about,
                resume.archived,
                resume.createdAt,
                resume.updatedAt
            )
            FROM CandidateResume resume
            JOIN resume.candidateProfile profile
            LEFT JOIN resume.employment employment
            LEFT JOIN resume.workFormat workFormat
            LEFT JOIN resume.experience experience
            WHERE profile.user.id = :userId
              AND (resume.archived IS NULL OR resume.archived = false)
            ORDER BY resume.createdAt ASC
            """)
    List<CandidateResumeSummaryProjection> findActiveSummariesByUserId(
            @Param("userId") Integer userId
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection(
                profile.id,
                resume.id,
                resume.profession,
                profile.city,
                resume.expectedSalaryFrom,
                resume.expectedSalaryTo,
                employment.id,
                employment.name,
                workFormat.id,
                workFormat.name,
                experience.id,
                experience.name,
                resume.about,
                resume.archived,
                resume.createdAt,
                resume.updatedAt
            )
            FROM CandidateResume resume
            JOIN resume.candidateProfile profile
            LEFT JOIN resume.employment employment
            LEFT JOIN resume.workFormat workFormat
            LEFT JOIN resume.experience experience
            WHERE resume.id = :resumeId
              AND profile.user.id = :userId
            """)
    Optional<CandidateResumeSummaryProjection> findSummaryByIdAndUserId(
            @Param("resumeId") Long resumeId,
            @Param("userId") Integer userId
    );

    @Query(
            value = """
                    SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeSearchProjection(
                        profile.id,
                        u.id,
                        u.email,
                        u.phoneNumber,
                        profile.firstName,
                        profile.lastName,
                        profile.birthday,
                        u.avatarUrl,
                        profile.about,
                        profile.resumeUrl,
                        profile.portfolioUrl,
                        profile.openToWork,
                        resume.id,
                        resume.profession,
                        profile.city,
                        resume.expectedSalaryFrom,
                        resume.expectedSalaryTo,
                        employment.id,
                        employment.name,
                        workFormat.id,
                        workFormat.name,
                        experience.id,
                        experience.name,
                        resume.about,
                        resume.archived,
                        resume.createdAt,
                        resume.updatedAt
                    )
                    FROM CandidateResume resume
                    JOIN resume.candidateProfile profile
                    JOIN profile.user u
                    LEFT JOIN resume.employment employment
                    LEFT JOIN resume.workFormat workFormat
                    LEFT JOIN resume.experience experience
                    WHERE u.role.id = 'ROLE_USER'
                      AND u.status = :status
                      AND (resume.archived IS NULL OR resume.archived = false)
                      AND (:openToWork IS NULL OR profile.openToWork = :openToWork)
                      AND (:cityPattern IS NULL OR LOWER(profile.city) LIKE :cityPattern)
                      AND (
                            :searchPattern IS NULL
                            OR LOWER(resume.profession) LIKE :searchPattern
                            OR LOWER(resume.about) LIKE :searchPattern
                      )
                      AND (
                            :skillIdsEmpty = TRUE
                            OR EXISTS (
                                SELECT filterResumeSkill.id
                                FROM CandidateResume filterResume
                                JOIN filterResume.skills filterResumeSkill
                                WHERE filterResume = resume
                                  AND filterResumeSkill.id IN :skillIds
                            )
                      )
                    ORDER BY COALESCE(resume.updatedAt, resume.createdAt) DESC
                    """,
            countQuery = """
                    SELECT COUNT(resume)
                    FROM CandidateResume resume
                    JOIN resume.candidateProfile profile
                    JOIN profile.user u
                    WHERE u.role.id = 'ROLE_USER'
                      AND u.status = :status
                      AND (resume.archived IS NULL OR resume.archived = false)
                      AND (:openToWork IS NULL OR profile.openToWork = :openToWork)
                      AND (:cityPattern IS NULL OR LOWER(profile.city) LIKE :cityPattern)
                      AND (
                            :searchPattern IS NULL
                            OR LOWER(resume.profession) LIKE :searchPattern
                            OR LOWER(resume.about) LIKE :searchPattern
                      )
                      AND (
                            :skillIdsEmpty = TRUE
                            OR EXISTS (
                                SELECT filterResumeSkill.id
                                FROM CandidateResume filterResume
                                JOIN filterResume.skills filterResumeSkill
                                WHERE filterResume = resume
                                  AND filterResumeSkill.id IN :skillIds
                            )
                      )
                    """
    )
    Page<CandidateResumeSearchProjection> searchCandidateResumes(
            @Param("searchPattern") String searchPattern,
            @Param("cityPattern") String cityPattern,
            @Param("openToWork") Boolean openToWork,
            @Param("skillIds") Set<Integer> skillIds,
            @Param("skillIdsEmpty") boolean skillIdsEmpty,
            @Param("status") AccountStatus status,
            Pageable pageable
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeSkillProjection(
                resume.id,
                skill.id,
                skill.name
            )
            FROM CandidateResume resume
            JOIN resume.skills skill
            WHERE resume.id IN :resumeIds
            ORDER BY resume.id, skill.name
            """)
    List<CandidateResumeSkillProjection> findSkillDtosByResumeIds(
            @Param("resumeIds") List<Long> resumeIds
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeLanguageProjection(
                resumeLanguage.resume.id,
                resumeLanguage.id,
                dictionary.id,
                dictionary.name,
                resumeLanguage.level
            )
            FROM CandidateResumeLanguage resumeLanguage
            JOIN resumeLanguage.language dictionary
            WHERE resumeLanguage.resume.id IN :resumeIds
            ORDER BY resumeLanguage.resume.id, resumeLanguage.sortOrder, resumeLanguage.id
            """)
    List<CandidateResumeLanguageProjection> findLanguageDtosByResumeIds(
            @Param("resumeIds") List<Long> resumeIds
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeEducationProjection(
                education.resume.id,
                education.id,
                education.institution,
                education.specialty,
                education.educationLevel,
                education.startDate,
                education.endDate,
                education.currentlyStudying
            )
            FROM CandidateResumeEducation education
            WHERE education.resume.id IN :resumeIds
            ORDER BY education.resume.id, education.sortOrder, education.id
            """)
    List<CandidateResumeEducationProjection> findEducationDtosByResumeIds(
            @Param("resumeIds") List<Long> resumeIds
    );

    @Query("""
            SELECT new com.diplom.internhubbackend.dto.projection.CandidateResumeWorkExperienceProjection(
                workExperience.resume.id,
                workExperience.id,
                workExperience.company,
                workExperience.position,
                workFormat.id,
                workFormat.name,
                workExperience.startDate,
                workExperience.endDate,
                workExperience.currentlyWorking,
                workExperience.projectUrl
            )
            FROM CandidateResumeWorkExperience workExperience
            JOIN workExperience.workFormat workFormat
            WHERE workExperience.resume.id IN :resumeIds
            ORDER BY workExperience.resume.id, workExperience.sortOrder, workExperience.id
            """)
    List<CandidateResumeWorkExperienceProjection> findWorkExperienceDtosByResumeIds(
            @Param("resumeIds") List<Long> resumeIds
    );
}
