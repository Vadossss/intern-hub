package com.diplom.internhubbackend.dto.projection;

public record CandidateResumeSkillProjection(
        Long resumeId,
        Integer skillId,
        String skillName
) {
}
