package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "vacancy")
@Getter
@Setter
@NoArgsConstructor
public class Vacancy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String city;

    private Integer salaryFrom;
    private Integer salaryTo;

    @ManyToOne
    @JoinColumn(name = "currency_id")
    private Currency currency;

    private String description;
    private String requirements;
    private String conditions;
    private String link;
    private String charge;

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

//    @ManyToMany(mappedBy = "vacancies", fetch = FetchType.EAGER)
    @ManyToMany
    @JoinTable(
            name = "vacancy_skill",
            joinColumns = @JoinColumn(name = "vacancy_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<KeySkill> skills;

    @CreatedDate
    private LocalDateTime createdAt;

    public Vacancy(String title, Integer salaryFrom, Integer salaryTo, String city, Currency currency, String description,
                   String requirements, String conditions, String link, String charge, Employment employment,
                   Experience experience, WorkFormat workFormat, Set<KeySkill> skills, LocalDateTime createdAt) {
        this.title = title;
        this.salaryFrom = salaryFrom;
        this.salaryTo = salaryTo;
        this.city = city;
        this.currency = currency;
        this.description = description;
        this.requirements = requirements;
        this.conditions = conditions;
        this.link = link;
        this.charge = charge;
        this.employment = employment;
        this.experience = experience;
        this.workFormat = workFormat;
        this.skills = skills;
        this.createdAt = createdAt;
    }
}
