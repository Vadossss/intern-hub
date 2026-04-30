package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.dto.hh.HhEmployerEntity;
import com.diplom.internhubbackend.enums.UserRole;
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


    @Async()
    @Transactional
    public CompletableFuture<User> createAggregationEmployer(HhEmployerEntity hhEmployerEntity) {
        Role companyRole = userRoleService.findRoleById(UserRole.ROLE_EMPLOYER.name());
        return CompletableFuture.completedFuture(userRepository.findUserByCompanyName(hhEmployerEntity.name()).orElseGet(() -> {
            if (Boolean.TRUE.equals(hhEmployerEntity.trusted())) {
                return userRepository.save(User
                        .builder()
                                .companyName(hhEmployerEntity.name())
                                .isAggregated(true)
                                .role(companyRole)
                                .verified(hhEmployerEntity.trusted())
                        .build());
            }
            return null;
        }));
    }

    @Cacheable(value = "user", key = "#userId")
    public User getUserById(Integer userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
    }
}
