package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, String> {
    Optional<Role> findById(String id);
}
