package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.CandidateResumeEducationDto;
import com.diplom.internhubbackend.dto.CandidateResumeLanguageDto;
import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.CandidateResumeWorkExperienceDto;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.dto.projection.CandidateResumeEducationProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeLanguageProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSkillProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeWorkExperienceProjection;
import com.diplom.internhubbackend.mapper.CandidateResumeMapper;
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateResumeReadService {
    private final CandidateResumeRepository candidateResumeRepository;
    private final CandidateResumeMapper candidateResumeMapper;
    private final ViewTrackingService viewTrackingService;

    @Transactional(readOnly = true)
    public List<CandidateResumeResponseDto> getResumesByUserId(Integer userId, boolean includeArchived) {
        List<CandidateResumeSummaryProjection> resumes = includeArchived
                ? candidateResumeRepository.findSummariesByUserId(userId)
                : candidateResumeRepository.findActiveSummariesByUserId(userId);

        return toDtos(resumes);
    }

    @Transactional(readOnly = true)
    public CandidateResumeResponseDto getResumeByIdAndUserId(Long resumeId, Integer userId) {
        CandidateResumeSummaryProjection resume = candidateResumeRepository
                .findSummaryByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found"));

        return toDtos(List.of(resume)).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found"));
    }

    private List<CandidateResumeResponseDto> toDtos(List<CandidateResumeSummaryProjection> resumes) {
        if (resumes == null || resumes.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> resumeIds = getResumeIds(resumes);
        Map<Long, Set<KeySkillDto>> skillsByResumeId = getSkillsByResumeId(resumeIds);
        Map<Long, List<CandidateResumeLanguageDto>> languagesByResumeId = getLanguagesByResumeId(resumeIds);
        Map<Long, List<CandidateResumeEducationDto>> educationByResumeId = getEducationByResumeId(resumeIds);
        Map<Long, List<CandidateResumeWorkExperienceDto>> workExperienceByResumeId =
                getWorkExperienceByResumeId(resumeIds);
        Map<Long, Long> viewCountsByResumeId = viewTrackingService.countResumeViewsByIds(resumeIds);

        return resumes.stream()
                .map(resume -> candidateResumeMapper.toDto(
                        resume,
                        skillsByResumeId.getOrDefault(resume.id(), Collections.emptySet()),
                        languagesByResumeId.getOrDefault(resume.id(), Collections.emptyList()),
                        educationByResumeId.getOrDefault(resume.id(), Collections.emptyList()),
                        workExperienceByResumeId.getOrDefault(resume.id(), Collections.emptyList()),
                        viewCountsByResumeId.getOrDefault(resume.id(), 0L)
                ))
                .toList();
    }

    private List<Long> getResumeIds(List<CandidateResumeSummaryProjection> resumes) {
        return resumes.stream()
                .map(CandidateResumeSummaryProjection::id)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private Map<Long, Set<KeySkillDto>> getSkillsByResumeId(List<Long> resumeIds) {
        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findSkillDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeSkillProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(
                                skill -> new KeySkillDto(skill.skillId(), skill.skillName()),
                                Collectors.toSet()
                        )
                ));
    }

    private Map<Long, List<CandidateResumeLanguageDto>> getLanguagesByResumeId(List<Long> resumeIds) {
        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findLanguageDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeLanguageProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(this::toLanguageDto, Collectors.toList())
                ));
    }

    private CandidateResumeLanguageDto toLanguageDto(CandidateResumeLanguageProjection language) {
        return CandidateResumeLanguageDto.builder()
                .id(language.id())
                .languageId(language.languageId())
                .languageName(language.languageName())
                .level(language.level())
                .build();
    }

    private Map<Long, List<CandidateResumeEducationDto>> getEducationByResumeId(List<Long> resumeIds) {
        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findEducationDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeEducationProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(this::toEducationDto, Collectors.toList())
                ));
    }

    private CandidateResumeEducationDto toEducationDto(CandidateResumeEducationProjection education) {
        return CandidateResumeEducationDto.builder()
                .id(education.id())
                .institution(education.institution())
                .specialty(education.specialty())
                .educationLevel(education.educationLevel())
                .startDate(education.startDate())
                .endDate(education.endDate())
                .currentlyStudying(Boolean.TRUE.equals(education.currentlyStudying()))
                .build();
    }

    private Map<Long, List<CandidateResumeWorkExperienceDto>> getWorkExperienceByResumeId(List<Long> resumeIds) {
        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findWorkExperienceDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeWorkExperienceProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(this::toWorkExperienceDto, Collectors.toList())
                ));
    }

    private CandidateResumeWorkExperienceDto toWorkExperienceDto(CandidateResumeWorkExperienceProjection workExperience) {
        return CandidateResumeWorkExperienceDto.builder()
                .id(workExperience.id())
                .company(workExperience.company())
                .position(workExperience.position())
                .workFormatId(workExperience.workFormatId())
                .workFormatName(workExperience.workFormatName())
                .startDate(workExperience.startDate())
                .endDate(workExperience.endDate())
                .currentlyWorking(Boolean.TRUE.equals(workExperience.currentlyWorking()))
                .projectUrl(workExperience.projectUrl())
                .build();
    }
}
