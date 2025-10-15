package com.diplom.internhubbackend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {
    @Id
    private Integer id;

    private String firstName;
    private String lastName;
    private String patronymic;
    private String education;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}
