package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.CandidateApplicationHistoryDto;
import com.diplom.internhubbackend.dto.CandidateProfileResponseDto;
import com.diplom.internhubbackend.dto.CandidateProfileUpdateDto;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.CandidateProfile;
import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.repositories.ApplicationRepository;
import com.diplom.internhubbackend.repositories.CandidateProfileRepository;
import com.diplom.internhubbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final KeySkillService keySkillService;

    @Transactional
    public CandidateProfileResponseDto updateProfile(User user, CandidateProfileUpdateDto request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }

        if (request.getAbout() != null) {
            profile.setAbout(request.getAbout());
        }
        if (request.getResumeUrl() != null) {
            profile.setResumeUrl(request.getResumeUrl());
        }
        if (request.getPortfolioUrl() != null) {
            profile.setPortfolioUrl(request.getPortfolioUrl());
        }
        if (request.getPreferredCity() != null) {
            profile.setPreferredCity(request.getPreferredCity());
        }
        if (request.getPreferredWorkFormat() != null) {
            profile.setPreferredWorkFormat(request.getPreferredWorkFormat());
        }
        if (request.getPreferredEmployment() != null) {
            profile.setPreferredEmployment(request.getPreferredEmployment());
        }
        if (request.getExpectedSalaryFrom() != null) {
            profile.setExpectedSalaryFrom(request.getExpectedSalaryFrom());
        }
        if (request.getExpectedSalaryTo() != null) {
            profile.setExpectedSalaryTo(request.getExpectedSalaryTo());
        }
        if (request.getOpenToWork() != null) {
            profile.setOpenToWork(request.getOpenToWork());
        }

        if (request.getSkillIds() != null) {
            Set<KeySkill> skills = keySkillService.getAllKeySkillsById(request.getSkillIds());
            profile.setSkills(skills);
        }

        userRepository.save(user);
        candidateProfileRepository.save(profile);

        return toDto(profile);
    }

    @Transactional(readOnly = true)
    public CandidateProfileResponseDto getProfile(User user) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        return toDto(profile);
    }

    @Transactional(readOnly = true)
    public CandidateProfileResponseDto getProfileByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.getRole() == null
                || !"ROLE_USER".equals(user.getRole().getId())) {
            throw new UserNotFoundException("Candidate not found");
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        return toDto(profile);
    }

    @Transactional(readOnly = true)
    public Page<CandidateApplicationHistoryDto> getApplicationHistory(User user, Pageable pageable) {
        return applicationRepository.findAllByCandidateIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(application -> new CandidateApplicationHistoryDto(
                        application.getId(),
                        application.getVacancy().getPublicId(),
                        application.getVacancy().getTitle(),
                        application.getVacancy().getEmployer() != null
                                ? application.getVacancy().getEmployer().getCompanyName()
                                : null,
                        application.getStatus().name(),
                        application.getCreatedAt(),
                        application.getUpdatedAt()
                ));
    }

    private CandidateProfileResponseDto toDto(CandidateProfile profile) {
        User user = profile.getUser();
        Set<KeySkillDto> skills = profile.getSkills() == null
                ? Collections.emptySet()
                : profile.getSkills().stream()
                .filter(Objects::nonNull)
                .map(skill -> new KeySkillDto(skill.getId(), skill.getName()))
                .collect(Collectors.toSet());

        return CandidateProfileResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .city(user.getCity())
                .about(profile.getAbout())
                .resumeUrl(profile.getResumeUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .preferredCity(profile.getPreferredCity())
                .preferredWorkFormat(profile.getPreferredWorkFormat())
                .preferredEmployment(profile.getPreferredEmployment())
                .expectedSalaryFrom(profile.getExpectedSalaryFrom())
                .expectedSalaryTo(profile.getExpectedSalaryTo())
                .openToWork(profile.getOpenToWork())
                .skills(skills)
                .build();
    }
}
