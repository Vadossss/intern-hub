package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Experience;
import com.diplom.internhubbackend.repositories.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExperienceService {
    private final ExperienceRepository experienceRepository;


    @Cacheable(value = "experience", key = "#experienceId")
    public Experience getExperienceById(String experienceId) {
        return experienceRepository.findById(experienceId).orElse(null);
    }
}
