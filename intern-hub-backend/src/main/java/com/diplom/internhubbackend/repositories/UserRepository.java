package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);

    @Query("""
            SELECT u FROM User u
            LEFT JOIN EmployerProfile p ON p.user.id = u.id
            WHERE u.role.id = 'ROLE_EMPLOYER'
              AND u.status = :status
              AND (
                :query IS NULL
                OR LOWER(COALESCE(p.companyName, '')) LIKE :query
                OR LOWER(COALESCE(p.city, '')) LIKE :query
                OR LOWER(COALESCE(p.about, '')) LIKE :query
                OR LOWER(COALESCE(p.website, '')) LIKE :query
              )
            ORDER BY COALESCE(p.updatedAt, u.updatedAt, p.createdAt, u.createdAt) DESC
            """)
    Page<User> searchPublicEmployers(
            @Param("status") AccountStatus status,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            SELECT u FROM User u
            LEFT JOIN EmployerProfile p ON p.user.id = u.id
            WHERE u.role.id = 'ROLE_EMPLOYER'
              AND (
                :query IS NULL
                OR LOWER(COALESCE(p.companyName, '')) LIKE :query
              )
            ORDER BY COALESCE(p.companyName, u.email)
            """)
    Page<User> searchAdminEmployers(
            @Param("query") String query,
            Pageable pageable
    );
}
