package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.CandidateResume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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
}
