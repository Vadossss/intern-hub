package com.diplom.internhubbackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateResumeLanguageDto {
    private Long id;
    private String languageId;
    private String languageName;
    private String level;
}
