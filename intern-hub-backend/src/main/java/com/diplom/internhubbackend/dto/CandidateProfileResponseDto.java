package com.diplom.internhubbackend.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Getter
@Builder
public class CandidateProfileResponseDto {
    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private String city;
    private String about;
    private String resumeUrl;
    private String portfolioUrl;
    private String preferredCity;
    private String preferredWorkFormat;
    private String preferredEmployment;
    private Long expectedSalaryFrom;
    private Long expectedSalaryTo;
    private Boolean openToWork;
    private Set<KeySkillDto> skills;
}
