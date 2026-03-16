package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.enums.VacancyStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FilterParams {

    private List<VacancySource> source;

    private Stack stack;

    private String city;

    private String schedule;

    private String employment;

    private Long salaryMin;

    private Long salaryMax;

    @Enumerated(EnumType.STRING)
    private VacancyStatus status;

    private String searchText;

    private List<String> workFormats;

    private Integer page;

    private Integer size;

    private String sortBy;

    private String sortDirection;
}
