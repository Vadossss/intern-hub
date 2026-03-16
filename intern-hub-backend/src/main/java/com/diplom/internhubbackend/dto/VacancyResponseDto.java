package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.dto.hh.EmployerDto;
import com.diplom.internhubbackend.enums.VacancyStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class VacancyResponseDto {
    private Integer id;
    private String publicId;
    private String title;
    private String stack;
    private String description;
    private String city;
    @Enumerated(EnumType.STRING)
    private VacancyStatus status;
    private Long salaryFrom;
    private Long salaryTo;
    private Currency currency;
    private Employment employment;
    private Experience experience;
    private WorkFormat workFormat;
    private EmployerDto employer;
    private Set<KeySkillDto> skills;
    private List<VacancyContactDto> contacts;
}
