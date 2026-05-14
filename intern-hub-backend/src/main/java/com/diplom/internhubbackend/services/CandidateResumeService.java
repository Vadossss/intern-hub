package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.CandidateResumeEducationDto;
import com.diplom.internhubbackend.dto.CandidateResumeUpsertDto;
import com.diplom.internhubbackend.dto.CandidateResumeViewStatsDto;
import com.diplom.internhubbackend.dto.CandidateResumeWorkExperienceDto;
import com.diplom.internhubbackend.models.CandidateProfile;
import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.models.CandidateResumeEducation;
import com.diplom.internhubbackend.models.CandidateResumeLanguage;
import com.diplom.internhubbackend.models.CandidateResumeWorkExperience;
import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.Language;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.WorkFormat;
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CandidateResumeService {
    private static final int MAX_RESUMES = 5;
    private static final String DEFAULT_RESUME_PROFESSION = "Новое резюме";

    private final CandidateResumeRepository candidateResumeRepository;
    private final CandidateProfileService candidateProfileService;
    private final CandidateResumeReadService candidateResumeReadService;
    private final KeySkillService keySkillService;
    private final EmploymentService employmentService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final LanguageService languageService;
    private final ViewTrackingService viewTrackingService;

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public CandidateResumeResponseDto ensureDefaultResume(User user) {
        CandidateProfile profile = candidateProfileService.getOrCreateProfile(user);

        if (candidateResumeRepository.countByCandidateProfile_User_Id(user.getId()) > 0) {
            return candidateResumeReadService.getResumesByUserId(user.getId(), true)
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        CandidateResume resume = CandidateResume.builder()
                .candidateProfile(profile)
                .profession(DEFAULT_RESUME_PROFESSION)
                .about(profile.getAbout())
                .expectedSalaryFrom(profile.getExpectedSalaryFrom())
                .expectedSalaryTo(profile.getExpectedSalaryTo())
                .skills(profile.getSkills() == null ? Collections.emptySet() : new HashSet<>(profile.getSkills()))
                .build();

        CandidateResume savedResume = candidateResumeRepository.save(resume);

        return candidateResumeReadService.getResumeByIdAndUserId(savedResume.getId(), user.getId());
    }

    @Transactional
    public List<CandidateResumeResponseDto> getMyResumes(User user) {
        return candidateResumeReadService.getResumesByUserId(user.getId(), true);
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public CandidateResumeResponseDto createResume(User user, CandidateResumeUpsertDto request) {
        CandidateResumeUpsertDto safeRequest = request == null ? new CandidateResumeUpsertDto() : request;
        CandidateProfile profile = candidateProfileService.getOrCreateProfile(user);

        if (candidateResumeRepository.countByCandidateProfile_User_Id(user.getId()) >= MAX_RESUMES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume limit exceeded");
        }

        validateRequiredFields(safeRequest);

        CandidateResume resume = CandidateResume.builder()
                .candidateProfile(profile)
                .profession(normalizeProfession(safeRequest.getProfession()))
                .build();

        applyRequest(resume, safeRequest);

        CandidateResume savedResume = candidateResumeRepository.save(resume);

        return candidateResumeReadService.getResumeByIdAndUserId(savedResume.getId(), user.getId());
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public CandidateResumeResponseDto updateResume(User user, Long resumeId, CandidateResumeUpsertDto request) {
        CandidateResumeUpsertDto safeRequest = request == null ? new CandidateResumeUpsertDto() : request;
        CandidateResume resume = candidateResumeRepository
                .findByIdAndCandidateProfile_User_Id(resumeId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found"));

        validateRequiredFields(safeRequest);
        applyRequest(resume, safeRequest);

        CandidateResume savedResume = candidateResumeRepository.save(resume);

        return candidateResumeReadService.getResumeByIdAndUserId(savedResume.getId(), user.getId());
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public CandidateResumeResponseDto archiveResume(User user, Long resumeId) {
        CandidateResume resume = getOwnedResume(user, resumeId);
        resume.setArchived(true);

        CandidateResume savedResume = candidateResumeRepository.save(resume);

        return candidateResumeReadService.getResumeByIdAndUserId(savedResume.getId(), user.getId());
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public CandidateResumeResponseDto restoreResume(User user, Long resumeId) {
        CandidateResume resume = getOwnedResume(user, resumeId);
        resume.setArchived(false);

        CandidateResume savedResume = candidateResumeRepository.save(resume);

        return candidateResumeReadService.getResumeByIdAndUserId(savedResume.getId(), user.getId());
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public void deleteResume(User user, Long resumeId) {
        CandidateResume resume = getOwnedResume(user, resumeId);

        candidateResumeRepository.delete(resume);
    }

    @Transactional(readOnly = true)
    public CandidateResumeViewStatsDto getResumeViewStats(User user, Long resumeId, int days) {
        getOwnedResume(user, resumeId);

        return viewTrackingService.getResumeViewStats(resumeId, days);
    }

    private CandidateResume getOwnedResume(User user, Long resumeId) {
        return candidateResumeRepository
                .findByIdAndCandidateProfile_User_Id(resumeId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found"));
    }

    private void validateRequiredFields(CandidateResumeUpsertDto request) {
        if (isBlank(request.getProfession())
                || isBlank(request.getEmploymentId())
                || isBlank(request.getWorkFormatId())
                || isBlank(request.getExperienceId())
                || isBlankHtml(request.getAbout())
                || request.getSkillIds() == null
                || request.getSkillIds().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Profession, employment, work format, experience, about and skills are required"
            );
        }
    }

    private void applyRequest(CandidateResume resume, CandidateResumeUpsertDto request) {
        resume.setProfession(normalizeProfession(request.getProfession()));
        resume.setExpectedSalaryFrom(request.getExpectedSalaryFrom());
        resume.setExpectedSalaryTo(request.getExpectedSalaryTo());
        resume.setEmployment(isBlank(request.getEmploymentId()) ? null : employmentService.getEmploymentById(request.getEmploymentId()));
        resume.setWorkFormat(isBlank(request.getWorkFormatId()) ? null : workFormatService.getWorkFormatById(request.getWorkFormatId()));
        resume.setExperience(isBlank(request.getExperienceId()) ? null : experienceService.getExperienceById(request.getExperienceId()));
        resume.setAbout(request.getAbout());

        Set<KeySkill> skills = request.getSkillIds() == null || request.getSkillIds().isEmpty()
                ? Collections.emptySet()
                : keySkillService.getAllKeySkillsById(request.getSkillIds());
        resume.setSkills(skills);

        applyLanguages(resume, request);
        applyEducation(resume, request);
        applyWorkExperience(resume, request);
    }

    private void applyLanguages(CandidateResume resume, CandidateResumeUpsertDto request) {
        resume.getLanguages().clear();

        if (request.getLanguages() == null) {
            return;
        }

        for (int index = 0; index < request.getLanguages().size(); index++) {
            var item = request.getLanguages().get(index);
            if (item == null || (isBlank(item.getLanguageId()) && isBlank(item.getLevel()))) {
                continue;
            }
            if (isBlank(item.getLanguageId()) || isBlank(item.getLevel())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language and level are required");
            }

            Language language = languageService.getLanguageById(item.getLanguageId());
            if (language == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language not found");
            }

            resume.getLanguages().add(CandidateResumeLanguage.builder()
                    .resume(resume)
                    .language(language)
                    .level(item.getLevel().trim())
                    .sortOrder(index)
                    .build());
        }
    }

    private void applyEducation(CandidateResume resume, CandidateResumeUpsertDto request) {
        resume.getEducation().clear();

        if (request.getEducation() == null) {
            return;
        }

        for (int index = 0; index < request.getEducation().size(); index++) {
            var item = request.getEducation().get(index);
            if (item == null || isBlankEducation(item)) {
                continue;
            }

            boolean currentlyStudying = Boolean.TRUE.equals(item.getCurrentlyStudying());
            if (isBlank(item.getInstitution())
                    || isBlank(item.getSpecialty())
                    || isBlank(item.getEducationLevel())
                    || item.getStartDate() == null
                    || item.getEndDate() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Education institution, specialty, level, start and end dates are required"
                );
            }

            resume.getEducation().add(CandidateResumeEducation.builder()
                    .resume(resume)
                    .institution(item.getInstitution().trim())
                    .specialty(item.getSpecialty().trim())
                    .educationLevel(item.getEducationLevel().trim())
                    .startDate(item.getStartDate())
                    .endDate(item.getEndDate())
                    .currentlyStudying(currentlyStudying)
                    .sortOrder(index)
                    .build());
        }
    }

    private void applyWorkExperience(CandidateResume resume, CandidateResumeUpsertDto request) {
        resume.getWorkExperience().clear();

        if (request.getWorkExperience() == null) {
            return;
        }

        for (int index = 0; index < request.getWorkExperience().size(); index++) {
            var item = request.getWorkExperience().get(index);
            if (item == null || isBlankWorkExperience(item)) {
                continue;
            }

            boolean currentlyWorking = Boolean.TRUE.equals(item.getCurrentlyWorking())
                    || item.getEndDate() == null;
            if (isBlank(item.getCompany())
                    || isBlank(item.getPosition())
                    || isBlank(item.getWorkFormatId())
                    || item.getStartDate() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Work company, position, format and start date are required"
                );
            }

            WorkFormat workFormat = workFormatService.getWorkFormatById(item.getWorkFormatId());

            resume.getWorkExperience().add(CandidateResumeWorkExperience.builder()
                    .resume(resume)
                    .company(item.getCompany().trim())
                    .position(item.getPosition().trim())
                    .workFormat(workFormat)
                    .startDate(item.getStartDate())
                    .endDate(currentlyWorking ? null : item.getEndDate())
                    .currentlyWorking(currentlyWorking)
                    .projectUrl(isBlank(item.getProjectUrl()) ? null : item.getProjectUrl().trim())
                    .sortOrder(index)
                    .build());
        }
    }

    private boolean isBlankEducation(CandidateResumeEducationDto item) {
        return isBlank(item.getInstitution())
                && isBlank(item.getSpecialty())
                && isBlank(item.getEducationLevel())
                && item.getStartDate() == null
                && item.getEndDate() == null
                && !Boolean.TRUE.equals(item.getCurrentlyStudying());
    }

    private boolean isBlankWorkExperience(CandidateResumeWorkExperienceDto item) {
        return isBlank(item.getCompany())
                && isBlank(item.getPosition())
                && isBlank(item.getWorkFormatId())
                && item.getStartDate() == null
                && item.getEndDate() == null
                && !Boolean.TRUE.equals(item.getCurrentlyWorking())
                && isBlank(item.getProjectUrl());
    }

    private String normalizeProfession(String profession) {
        return isBlank(profession) ? DEFAULT_RESUME_PROFESSION : profession.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean isBlankHtml(String value) {
        if (value == null) {
            return true;
        }

        String text = value
                .replaceAll("<[^>]*>", "")
                .replace("&nbsp;", " ")
                .trim();
        return text.isBlank();
    }
}
