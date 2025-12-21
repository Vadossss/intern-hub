package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Employment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentRepository extends JpaRepository<Employment, String> {
}
