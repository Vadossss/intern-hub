package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "candidate_resume")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateResume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    private CandidateProfile candidateProfile;

    @Column(nullable = false)
    private String profession;

    private String city;

    private Long expectedSalaryFrom;

    private Long expectedSalaryTo;

    @ManyToOne
    @JoinColumn(name = "employment_id")
    private Employment employment;

    @ManyToOne
    @JoinColumn(name = "work_format_id")
    private WorkFormat workFormat;

    @ManyToOne
    @JoinColumn(name = "experience_id")
    private Experience experience;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Builder.Default
    private Boolean archived = false;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "candidate_resume_skill",
            joinColumns = @JoinColumn(name = "candidate_resume_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<KeySkill> skills = new HashSet<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
