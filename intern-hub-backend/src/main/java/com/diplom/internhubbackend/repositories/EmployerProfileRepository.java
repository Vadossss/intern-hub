package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.EmployerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, Long> {
    Optional<EmployerProfile> findByUserId(Integer userId);

    List<EmployerProfile> findAllByUserIdIn(List<Integer> userIds);

    Optional<EmployerProfile> findByCompanyNameIgnoreCase(String companyName);
}
