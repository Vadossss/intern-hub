package com.diplom.internhubbackend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "work_format")
@Getter
@Setter
public class WorkFormat {
    @Id
    private String id;
    private String name;
}
