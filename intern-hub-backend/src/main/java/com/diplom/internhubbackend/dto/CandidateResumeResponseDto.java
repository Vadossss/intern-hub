package com.diplom.internhubbackend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
public class CandidateResumeResponseDto {
    private Long id;
    private String profession;
    private String city;
    private Long expectedSalaryFrom;
    private Long expectedSalaryTo;
    private String employmentId;
    private String employmentName;
    private String workFormatId;
    private String workFormatName;
    private String experienceId;
    private String experienceName;
    private String about;
    private Boolean archived;
    private Set<KeySkillDto> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
