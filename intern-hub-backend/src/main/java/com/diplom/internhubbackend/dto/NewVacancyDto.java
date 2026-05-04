package com.diplom.internhubbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class NewVacancyDto {
    private String title;
    private String stack;
    private String description;
    private Salary salary;
    private String city;
    private String link;
    private String employment;
    private String experience;
    private String workFormat;
    private Set<Integer> skills;
    private List<VacancyContactDto> contactsList;

    @Getter
    @Setter
    public static class Salary {
        private Long from;
        private Long to;
        private String currency;
    }
}
