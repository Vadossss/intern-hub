package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.dto.aggregation.AggregatedEmployerData;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.dto.hh.HhEmployerEntity;
import com.diplom.internhubbackend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final EmployerProfileService employerProfileService;


    @Async()
    @Transactional
    public CompletableFuture<User> createAggregationEmployer(HhEmployerEntity hhEmployerEntity) {
        String companyName = hhEmployerEntity.name();
        if (companyName == null || companyName.isBlank()) {
            return CompletableFuture.completedFuture(null);
        }
        String logoUrl = hhEmployerEntity.logoUrls() != null
                ? firstNonBlank(hhEmployerEntity.logoUrls().original(), hhEmployerEntity.logoUrls().big())
                : null;
        User employer = employerProfileService.resolveAggregatedEmployer(new AggregatedEmployerData(
                "HH",
                hhEmployerEntity.id(),
                companyName,
                null,
                logoUrl,
                null,
                hhEmployerEntity.alternateUrl(),
                null,
                hhEmployerEntity.trusted(),
                hhEmployerEntity.accreditedItEmployer()
        ));

        return CompletableFuture.completedFuture(employer);
    }

    @Transactional
    public CompletableFuture<User> createAggregationEmployer(AggregatedEmployerData employerData) {
        return CompletableFuture.completedFuture(employerProfileService.resolveAggregatedEmployer(employerData));
    }

    @Cacheable(value = "user", key = "#userId")
    public User getUserById(Integer userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private String firstNonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
