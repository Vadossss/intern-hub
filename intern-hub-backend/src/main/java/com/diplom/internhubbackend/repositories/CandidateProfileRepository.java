package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.models.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    Optional<CandidateProfile> findByUserId(Integer userId);

    @Query("""
            SELECT DISTINCT cp FROM CandidateProfile cp
            JOIN cp.user u
            LEFT JOIN cp.skills s
            WHERE u.role.id = 'ROLE_USER'
              AND u.status = :status
              AND (:openToWork IS NULL OR cp.openToWork = :openToWork)
            """)
    List<CandidateProfile> searchCandidatesNoSkills(
            @Param("openToWork") Boolean openToWork,
            @Param("status") AccountStatus status
    );

    @Query("""
            SELECT DISTINCT cp FROM CandidateProfile cp
            JOIN cp.user u
            JOIN cp.skills s
            WHERE u.role.id = 'ROLE_USER'
              AND u.status = :status
              AND s.id IN :skillIds
              AND (:openToWork IS NULL OR cp.openToWork = :openToWork)
            """)
    List<CandidateProfile> searchCandidatesWithSkills(
            @Param("openToWork") Boolean openToWork,
            @Param("skillIds") Set<Integer> skillIds,
            @Param("status") AccountStatus status
    );
}
