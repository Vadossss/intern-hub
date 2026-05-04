package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeySkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @ManyToMany(mappedBy = "skills", fetch = FetchType.EAGER)
    private Set<Vacancy> vacancies;
}
