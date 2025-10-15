package com.diplom.internhubbackend.models;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class InternshipRequest {
    private String name;
    private String description;
    private String location;
    private Boolean isPaid;
    private LocalDate startDate;
    private LocalDate endDate;
    private String duration;
    private Integer salary;
    private Set<Integer> skills;
}
