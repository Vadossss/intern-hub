package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.CandidateResumeEducationDto;
import com.diplom.internhubbackend.dto.CandidateResumeLanguageDto;
import com.diplom.internhubbackend.dto.CandidateResumeWorkExperienceDto;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection;
import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.models.CandidateResumeEducation;
import com.diplom.internhubbackend.models.CandidateResumeLanguage;
import com.diplom.internhubbackend.models.CandidateResumeWorkExperience;
import com.diplom.internhubbackend.models.KeySkill;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
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
                .languages(toLanguageDtos(resume))
                .education(toEducationDtos(resume))
                .workExperience(toWorkExperienceDtos(resume))
                .viewCount(0L)
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }

    public CandidateResumeResponseDto toDto(
            CandidateResumeSummaryProjection resume,
            Set<KeySkillDto> skills,
            List<CandidateResumeLanguageDto> languages,
            List<CandidateResumeEducationDto> education,
            List<CandidateResumeWorkExperienceDto> workExperience,
            Long viewCount
    ) {
        return CandidateResumeResponseDto.builder()
                .id(resume.id())
                .profession(resume.profession())
                .city(resume.city())
                .expectedSalaryFrom(resume.expectedSalaryFrom())
                .expectedSalaryTo(resume.expectedSalaryTo())
                .employmentId(resume.employmentId())
                .employmentName(resume.employmentName())
                .workFormatId(resume.workFormatId())
                .workFormatName(resume.workFormatName())
                .experienceId(resume.experienceId())
                .experienceName(resume.experienceName())
                .about(resume.about())
                .archived(Boolean.TRUE.equals(resume.archived()))
                .skills(skills == null ? Collections.emptySet() : skills)
                .languages(languages == null ? Collections.emptyList() : languages)
                .education(education == null ? Collections.emptyList() : education)
                .workExperience(workExperience == null ? Collections.emptyList() : workExperience)
                .viewCount(viewCount == null ? 0L : viewCount)
                .createdAt(resume.createdAt())
                .updatedAt(resume.updatedAt())
                .build();
    }

    private KeySkillDto toSkillDto(KeySkill skill) {
        return new KeySkillDto(skill.getId(), skill.getName());
    }

    private List<CandidateResumeLanguageDto> toLanguageDtos(CandidateResume resume) {
        if (resume.getLanguages() == null) {
            return Collections.emptyList();
        }

        return resume.getLanguages().stream()
                .filter(Objects::nonNull)
                .map(this::toLanguageDto)
                .toList();
    }

    private CandidateResumeLanguageDto toLanguageDto(CandidateResumeLanguage language) {
        return CandidateResumeLanguageDto.builder()
                .id(language.getId())
                .languageId(language.getLanguage() != null ? language.getLanguage().getId() : null)
                .languageName(language.getLanguage() != null ? language.getLanguage().getName() : null)
                .level(language.getLevel())
                .build();
    }

    private List<CandidateResumeEducationDto> toEducationDtos(CandidateResume resume) {
        if (resume.getEducation() == null) {
            return Collections.emptyList();
        }

        return resume.getEducation().stream()
                .filter(Objects::nonNull)
                .map(this::toEducationDto)
                .toList();
    }

    private CandidateResumeEducationDto toEducationDto(CandidateResumeEducation education) {
        return CandidateResumeEducationDto.builder()
                .id(education.getId())
                .institution(education.getInstitution())
                .specialty(education.getSpecialty())
                .educationLevel(education.getEducationLevel())
                .startDate(education.getStartDate())
                .endDate(education.getEndDate())
                .currentlyStudying(Boolean.TRUE.equals(education.getCurrentlyStudying()))
                .build();
    }

    private List<CandidateResumeWorkExperienceDto> toWorkExperienceDtos(CandidateResume resume) {
        if (resume.getWorkExperience() == null) {
            return Collections.emptyList();
        }

        return resume.getWorkExperience().stream()
                .filter(Objects::nonNull)
                .map(this::toWorkExperienceDto)
                .toList();
    }

    private CandidateResumeWorkExperienceDto toWorkExperienceDto(CandidateResumeWorkExperience workExperience) {
        return CandidateResumeWorkExperienceDto.builder()
                .id(workExperience.getId())
                .company(workExperience.getCompany())
                .position(workExperience.getPosition())
                .workFormatId(workExperience.getWorkFormat() != null ? workExperience.getWorkFormat().getId() : null)
                .workFormatName(workExperience.getWorkFormat() != null ? workExperience.getWorkFormat().getName() : null)
                .startDate(workExperience.getStartDate())
                .endDate(workExperience.getEndDate())
                .currentlyWorking(Boolean.TRUE.equals(workExperience.getCurrentlyWorking()))
                .projectUrl(workExperience.getProjectUrl())
                .build();
    }
}
