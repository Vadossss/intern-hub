package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "organization")
@Getter
@Setter
public class Organization {
    @Id
    private Integer id;

    private String name;
    private String description;
    private String linkToSite;
    private String industry;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}
