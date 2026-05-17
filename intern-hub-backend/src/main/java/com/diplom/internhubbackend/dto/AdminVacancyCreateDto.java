package com.diplom.internhubbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminVacancyCreateDto extends NewVacancyDto {
    private Integer employerId;
    private String sourceCode;
    private String externalId;
    private Boolean aggregated;
}
