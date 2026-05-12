package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "candidate_resume_education")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateResumeEducation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_resume_id", nullable = false)
    private CandidateResume resume;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String specialty;

    @Column(nullable = false)
    private String educationLevel;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    @Column(nullable = false)
    private Boolean currentlyStudying = false;

    private Integer sortOrder;
}
