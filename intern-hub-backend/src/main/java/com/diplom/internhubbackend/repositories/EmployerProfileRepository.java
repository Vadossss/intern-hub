package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.EmployerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, Long> {
    Optional<EmployerProfile> findByUserId(Integer userId);

    Optional<EmployerProfile> findByCompanyNameIgnoreCase(String companyName);
}
