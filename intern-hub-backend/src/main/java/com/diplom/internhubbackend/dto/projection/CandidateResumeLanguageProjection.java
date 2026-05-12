package com.diplom.internhubbackend.dto.projection;

public record CandidateResumeLanguageProjection(
        Long resumeId,
        Long id,
        String languageId,
        String languageName,
        String level
) {
}
