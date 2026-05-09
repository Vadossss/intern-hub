package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.dto.hh.HhEmployerEntity;
import com.diplom.internhubbackend.enums.UserRole;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
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
    private final UserRoleService userRoleService;
    private final EmployerProfileRepository employerProfileRepository;
    private final EmployerProfileService employerProfileService;


    @Async()
    @Transactional
    public CompletableFuture<User> createAggregationEmployer(HhEmployerEntity hhEmployerEntity) {
        Role companyRole = userRoleService.findRoleById(UserRole.ROLE_EMPLOYER.name());
        String companyName = hhEmployerEntity.name();
        if (companyName == null || companyName.isBlank()) {
            return CompletableFuture.completedFuture(null);
        }
        String logoUrl = hhEmployerEntity.logoUrls() != null
                ? firstNonBlank(hhEmployerEntity.logoUrls().original(), hhEmployerEntity.logoUrls().big())
                : null;
        User employer = employerProfileRepository.findByCompanyNameIgnoreCase(companyName)
                .map(profile -> profile.getUser())
                .or(() -> userRepository.findUserByCompanyName(companyName))
                .orElseGet(() -> {
            if (Boolean.TRUE.equals(hhEmployerEntity.trusted())) {
                return userRepository.save(User
                        .builder()
                                .companyName(companyName)
                                .isAggregated(true)
                                .role(companyRole)
                                .verified(hhEmployerEntity.trusted())
                        .build());
            }
            return null;
        });

        if (employer != null) {
            employerProfileService.ensureAggregatedEmployerProfile(employer, companyName, logoUrl);
        }

        return CompletableFuture.completedFuture(employer);
    }

    @Cacheable(value = "user", key = "#userId")
    public User getUserById(Integer userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private String firstNonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
