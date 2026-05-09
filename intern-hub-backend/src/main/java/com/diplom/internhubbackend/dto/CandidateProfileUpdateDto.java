package com.diplom.internhubbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class CandidateProfileUpdateDto {
    private String firstName;
    private String lastName;
    private LocalDate birthday;
    private String phoneNumber;
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
    private Set<Integer> skillIds;
}
