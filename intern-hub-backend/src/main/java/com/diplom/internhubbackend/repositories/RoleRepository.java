package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
}
