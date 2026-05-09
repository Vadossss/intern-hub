package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.enums.AuthTokenType;
import com.diplom.internhubbackend.models.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {
    Optional<AuthToken> findByValueAndType(String value, AuthTokenType type);
}
