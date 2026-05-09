package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.CandidateResumeUpsertDto;
import com.diplom.internhubbackend.mapper.CandidateResumeMapper;
import com.diplom.internhubbackend.models.CandidateProfile;
import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import lombok.RequiredArgsConstructor;
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
    private final CandidateResumeMapper candidateResumeMapper;
    private final KeySkillService keySkillService;
    private final EmploymentService employmentService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;

    @Transactional
    public CandidateResumeResponseDto ensureDefaultResume(User user) {
        CandidateProfile profile = candidateProfileService.getOrCreateProfile(user);

        if (candidateResumeRepository.countByCandidateProfile_User_Id(user.getId()) > 0) {
            return candidateResumeRepository
                    .findAllByCandidateProfile_User_IdOrderByCreatedAtAsc(user.getId())
                    .stream()
                    .findFirst()
                    .map(candidateResumeMapper::toDto)
                    .orElse(null);
        }

        CandidateResume resume = CandidateResume.builder()
                .candidateProfile(profile)
                .profession(DEFAULT_RESUME_PROFESSION)
                .city(profile.getPreferredCity())
                .about(profile.getAbout())
                .expectedSalaryFrom(profile.getExpectedSalaryFrom())
                .expectedSalaryTo(profile.getExpectedSalaryTo())
                .skills(profile.getSkills() == null ? Collections.emptySet() : new HashSet<>(profile.getSkills()))
                .build();

        return candidateResumeMapper.toDto(candidateResumeRepository.save(resume));
    }

    @Transactional
    public List<CandidateResumeResponseDto> getMyResumes(User user) {
        return candidateResumeRepository
                .findAllByCandidateProfile_User_IdOrderByCreatedAtAsc(user.getId())
                .stream()
                .map(candidateResumeMapper::toDto)
                .toList();
    }

    @Transactional
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

        return candidateResumeMapper.toDto(candidateResumeRepository.save(resume));
    }

    @Transactional
    public CandidateResumeResponseDto updateResume(User user, Long resumeId, CandidateResumeUpsertDto request) {
        CandidateResumeUpsertDto safeRequest = request == null ? new CandidateResumeUpsertDto() : request;
        CandidateResume resume = candidateResumeRepository
                .findByIdAndCandidateProfile_User_Id(resumeId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found"));

        validateRequiredFields(safeRequest);
        applyRequest(resume, safeRequest);

        return candidateResumeMapper.toDto(candidateResumeRepository.save(resume));
    }

    @Transactional
    public CandidateResumeResponseDto archiveResume(User user, Long resumeId) {
        CandidateResume resume = getOwnedResume(user, resumeId);
        resume.setArchived(true);

        return candidateResumeMapper.toDto(candidateResumeRepository.save(resume));
    }

    @Transactional
    public CandidateResumeResponseDto restoreResume(User user, Long resumeId) {
        CandidateResume resume = getOwnedResume(user, resumeId);
        resume.setArchived(false);

        return candidateResumeMapper.toDto(candidateResumeRepository.save(resume));
    }

    @Transactional
    public void deleteResume(User user, Long resumeId) {
        CandidateResume resume = getOwnedResume(user, resumeId);

        candidateResumeRepository.delete(resume);
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
        resume.setCity(request.getCity());
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
