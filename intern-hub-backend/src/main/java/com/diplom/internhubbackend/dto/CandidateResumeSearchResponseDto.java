package com.diplom.internhubbackend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class CandidateResumeSearchResponseDto {
    private Long profileId;
    private Integer userId;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private LocalDate birthday;
    private String avatarUrl;
    private String about;
    private String resumeUrl;
    private String portfolioUrl;
    private Boolean openToWork;
    private CandidateResumeResponseDto resume;
}
