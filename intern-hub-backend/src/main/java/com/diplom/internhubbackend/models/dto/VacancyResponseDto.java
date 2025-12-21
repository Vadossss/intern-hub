package com.diplom.internhubbackend.models.dto;

import com.diplom.internhubbackend.models.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
public class VacancyResponseDto {
    private Integer id;
    private String title;
    private Stack stack;
    private String description;
    private String city;
    private Integer salaryFrom;
    private Integer salaryTo;
    private Currency currency;
    private String charge;
    private String requirements;
    private String conditions;
    private String link;
    private Employment employment;
    private Experience experience;
    private WorkFormat workFormat;
    private User employer;
    private Set<KeySkillDto> skills;
}
