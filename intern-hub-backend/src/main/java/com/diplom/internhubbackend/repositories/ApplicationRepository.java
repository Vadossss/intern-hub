package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByCandidateIdAndVacancyId(Integer candidateId, Integer vacancyId);

    Optional<Application> findFirstByCandidateIdAndVacancyPublicIdOrderByCreatedAtDesc(
            Integer candidateId,
            String vacancyPublicId
    );

    Page<Application> findAllByCandidateIdOrderByCreatedAtDesc(Integer candidateId, Pageable pageable);

    Page<Application> findAllByVacancyPublicIdAndVacancyEmployerId(
            String vacancyPublicId,
            Integer employerId,
            Pageable pageable
    );

    Optional<Application> findByIdAndVacancyEmployerId(Long id, Integer employerId);
}
