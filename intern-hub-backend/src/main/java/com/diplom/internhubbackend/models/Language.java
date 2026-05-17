package com.diplom.internhubbackend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "language_dictionary")
@Getter
@Setter
public class Language {
    @Id
    private String id;

    private String name;
}
