package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_resume_language")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateResumeLanguage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_resume_id", nullable = false)
    private CandidateResume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "language_id", nullable = false)
    private Language language;

    @Column(nullable = false)
    private String level;

    private Integer sortOrder;
}
