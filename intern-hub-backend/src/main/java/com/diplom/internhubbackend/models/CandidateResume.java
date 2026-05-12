package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "candidate_resume_skill",
            joinColumns = @JoinColumn(name = "candidate_resume_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<KeySkill> skills = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<CandidateResumeLanguage> languages = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<CandidateResumeEducation> education = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<CandidateResumeWorkExperience> workExperience = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
