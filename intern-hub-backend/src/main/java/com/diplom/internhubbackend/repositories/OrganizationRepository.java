package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Integer> {
}
