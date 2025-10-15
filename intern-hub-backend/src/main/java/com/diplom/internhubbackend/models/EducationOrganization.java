package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "education_organization")
@Getter
@Setter
public class EducationOrganization {
    @Id
    private Integer id;

    private String name;
    private String description;
    private String linkToSite;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}
