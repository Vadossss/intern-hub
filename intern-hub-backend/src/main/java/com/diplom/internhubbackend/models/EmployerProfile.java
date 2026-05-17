package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "employer_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerProfile {
    public static final int START_SEQ = 10000;

    @Id
    @SequenceGenerator(name = "employer_profile_seq", sequenceName = "employer_profile_seq", allocationSize = 1, initialValue = START_SEQ)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "employer_profile_seq")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String companyName;

    private String city;

    private String website;

    private String contactName;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String about;

    private String avatarUrl;

    @Builder.Default
    private Boolean aggregated = false;

    private Boolean accredited;

    private Boolean verified;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
