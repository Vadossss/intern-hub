package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Stack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StackRepository extends JpaRepository<Stack, String> {
    Optional<Stack> getStackById(String id);
}
