package com.diplom.internhubbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class CandidateResumeUpsertDto {
    private String profession;
    private String city;
    private Long expectedSalaryFrom;
    private Long expectedSalaryTo;
    private String employmentId;
    private String workFormatId;
    private String experienceId;
    private String about;
    private Set<Integer> skillIds;
    private List<CandidateResumeLanguageDto> languages;
    private List<CandidateResumeEducationDto> education;
    private List<CandidateResumeWorkExperienceDto> workExperience;
}
