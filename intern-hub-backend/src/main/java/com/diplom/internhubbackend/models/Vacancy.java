package com.diplom.internhubbackend.models;

import com.diplom.internhubbackend.enums.VacancyStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "vacancy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vacancy {
    public static final int START_SEQ = 100000000;

    @Id
    @SequenceGenerator(name = "vacancy_seq", sequenceName = "vacancy_seq", allocationSize = 1, initialValue = START_SEQ)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vacancy_seq")
    private Integer id;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "public_id", unique = true)
    private String publicId;

    private String title;
    @ManyToOne
    @JoinColumn(name = "stack_id")
    private Stack stack;
    private String city;

    private Long salaryFrom;
    private Long salaryTo;

    @ManyToOne
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "source_id")
    private VacancySource source;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isAggregated = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private VacancyStatus status = VacancyStatus.APPROVED;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private User employer;

    @ManyToOne
    @JoinColumn(name = "employment_id")
    private Employment employment;

    @ManyToOne
    @JoinColumn(name = "experience_id")
    private Experience experience;

    @ManyToOne
    @JoinColumn(name = "work_format_id")
    private WorkFormat workFormat;

    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "vacancy_skill",
            joinColumns = @JoinColumn(name = "vacancy_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<KeySkill> skills;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @OneToMany(mappedBy = "vacancy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VacancyContact> contacts = new ArrayList<>();

    @OneToMany(mappedBy = "vacancy", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Application> applications = new ArrayList<>();
}
