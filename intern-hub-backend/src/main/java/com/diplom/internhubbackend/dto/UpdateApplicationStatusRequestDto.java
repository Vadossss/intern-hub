package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.VacancyApplicationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApplicationStatusRequestDto {
    private VacancyApplicationStatus status;
}
