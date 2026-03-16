package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByCandidateIdAndVacancyId(Integer candidateId, Integer vacancyId);
}
