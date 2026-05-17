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
public class CandidateResumeEducationDto {
    private Long id;
    private String institution;
    private String specialty;
    private String educationLevel;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean currentlyStudying;
}
