package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="learn")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Learn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    private String heading;
    private String content;



    public Learn(String heading, String content) {
        this.heading = heading;
        this.content = content;
    }

}
