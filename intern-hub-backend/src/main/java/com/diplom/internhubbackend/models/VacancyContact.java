package com.diplom.internhubbackend.models;

import com.diplom.internhubbackend.enums.ContactMethod;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vacancy_contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VacancyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactMethod method;

    private String value;

    private String hint;
}
