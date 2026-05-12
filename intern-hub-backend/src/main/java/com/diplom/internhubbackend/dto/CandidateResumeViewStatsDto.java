package com.diplom.internhubbackend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CandidateResumeViewStatsDto {
    private Long resumeId;
    private Long totalViews;
    private Integer days;
    private List<DailyViewDto> chart;
    private List<CompanyViewDto> companies;

    public record DailyViewDto(LocalDate date, Long views) {
    }

    public record CompanyViewDto(
            Integer employerId,
            String companyName,
            String avatarUrl,
            LocalDateTime viewedAt
    ) {
    }
}
