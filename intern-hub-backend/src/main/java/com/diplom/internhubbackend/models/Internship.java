package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "internship")
@Getter
@Setter
public class Internship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String description;
    private String location;
    private Boolean isPaid;
    private LocalDate startDate;
    private LocalDate endDate;
    private String duration;
    private Integer salary;

    @ManyToMany
    @JoinTable(
            name = "internship_skill",
            joinColumns = @JoinColumn(name = "internship_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<KeySkill> skills;

    @CreatedDate
    private LocalDateTime createdAt;
}
