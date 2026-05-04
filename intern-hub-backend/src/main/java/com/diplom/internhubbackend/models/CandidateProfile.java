package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "candidate_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String about;

    private String resumeUrl;

    private String portfolioUrl;

    private String preferredCity;

    private String preferredWorkFormat;

    private String preferredEmployment;

    private Long expectedSalaryFrom;

    private Long expectedSalaryTo;

    @Builder.Default
    @Column(nullable = false)
    private Boolean openToWork = true;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "candidate_profile_skill",
            joinColumns = @JoinColumn(name = "candidate_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<KeySkill> skills = new HashSet<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
