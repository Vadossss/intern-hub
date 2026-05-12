package com.diplom.internhubbackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateResumeWorkExperienceDto {
    private Long id;
    private String company;
    private String position;
    private String workFormatId;
    private String workFormatName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean currentlyWorking;
    private String projectUrl;
}
