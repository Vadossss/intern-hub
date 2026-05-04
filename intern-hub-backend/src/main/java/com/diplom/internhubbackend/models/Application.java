package com.diplom.internhubbackend.models;

import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.enums.VacancyApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "application",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"vacancy_id", "candidate_id"})
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private String resumeUrl;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VacancyApplicationStatus status = VacancyApplicationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ContactMethod chosenContactMethod;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
