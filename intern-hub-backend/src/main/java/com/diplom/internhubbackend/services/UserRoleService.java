package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserRoleService {

    private final RoleRepository roleRepository;

    @Cacheable(value = "role", key = "#id")
    public Role findRoleById(String id) {
        log.info("Finding role by id: {}", id);
        return roleRepository.findById(id).orElse(null);
    }
}
