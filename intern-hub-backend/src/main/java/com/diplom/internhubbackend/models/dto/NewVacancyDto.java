package com.diplom.internhubbackend.models.dto;

import com.diplom.internhubbackend.models.Currency;
import com.diplom.internhubbackend.models.Employment;
import com.diplom.internhubbackend.models.Experience;
import com.diplom.internhubbackend.models.enums.CurrencyEnum;
import com.diplom.internhubbackend.models.enums.WorkFormatEnum;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class NewVacancyDto {
    private String title;
    private String description;
    private Salary salary;
    private String charge;
    private String city;
    private String requirements;
    private String conditions;
    private String link;
    private String employment;
    private String experience;
    private String workFormat;
    private Set<Integer> skills;

    @Getter
    @Setter
    public static class Salary {
        private Integer from;
        private Integer to;
        private String currency;
    }
}
