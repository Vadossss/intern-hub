package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.models.KeySkill;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CandidateResumeMapper {
    public CandidateResumeResponseDto toDto(CandidateResume resume) {
        Set<KeySkillDto> skills = resume.getSkills() == null
                ? Collections.emptySet()
                : resume.getSkills().stream()
                .filter(Objects::nonNull)
                .map(this::toSkillDto)
                .collect(Collectors.toSet());

        return CandidateResumeResponseDto.builder()
                .id(resume.getId())
                .profession(resume.getProfession())
                .city(resume.getCity())
                .expectedSalaryFrom(resume.getExpectedSalaryFrom())
                .expectedSalaryTo(resume.getExpectedSalaryTo())
                .employmentId(resume.getEmployment() != null ? resume.getEmployment().getId() : null)
                .employmentName(resume.getEmployment() != null ? resume.getEmployment().getName() : null)
                .workFormatId(resume.getWorkFormat() != null ? resume.getWorkFormat().getId() : null)
                .workFormatName(resume.getWorkFormat() != null ? resume.getWorkFormat().getName() : null)
                .experienceId(resume.getExperience() != null ? resume.getExperience().getId() : null)
                .experienceName(resume.getExperience() != null ? resume.getExperience().getName() : null)
                .about(resume.getAbout())
                .archived(Boolean.TRUE.equals(resume.getArchived()))
                .skills(skills)
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }

    private KeySkillDto toSkillDto(KeySkill skill) {
        return new KeySkillDto(skill.getId(), skill.getName());
    }
}
