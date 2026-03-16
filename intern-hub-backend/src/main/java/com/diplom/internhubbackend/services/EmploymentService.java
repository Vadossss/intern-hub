package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Employment;
import com.diplom.internhubbackend.repositories.EmploymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmploymentService {

    private final EmploymentRepository employmentRepository;

    @Cacheable(value = "employment", key = "#employmentId")
    public Employment getEmploymentById(String employmentId) {
        return employmentRepository.findById(employmentId).orElse(null);
    }
}
