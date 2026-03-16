package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vacancy_source")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VacancySource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean isVisible = true;

    @Column(nullable = false)
    private String baseUrl;

    @Column(nullable = false)
    private Integer ttlDays;
}
