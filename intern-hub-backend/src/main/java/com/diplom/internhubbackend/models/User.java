package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.security.Timestamp;
import java.util.Date;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true, nullable = false, length = 200)
    private String email;
    @Column(unique = true, nullable = false, length = 20)
    private String phoneNumber;
    @Column(nullable = false)
    private String password;
    private String city;

    private UserRole role;

    private Boolean verified;
    private VerificationStatus verificationStatus;
    private Timestamp verifiedAt;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;
}
