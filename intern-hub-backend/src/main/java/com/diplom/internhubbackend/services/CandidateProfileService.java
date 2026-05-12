package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.CandidateApplicationEmployerDto;
import com.diplom.internhubbackend.dto.CandidateApplicationHistoryDto;
import com.diplom.internhubbackend.dto.CandidateProfileResponseDto;
import com.diplom.internhubbackend.dto.CandidateProfileUpdateDto;
import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.dto.hh.EmployerDto;
import com.diplom.internhubbackend.enums.VacancyApplicationStatus;
import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.mapper.UserMapper;
import com.diplom.internhubbackend.models.CandidateProfile;
import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyDirection;
import com.diplom.internhubbackend.repositories.ApplicationRepository;
import com.diplom.internhubbackend.repositories.CandidateProfileRepository;
import com.diplom.internhubbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
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
    private final FileStorageService fileStorageService;
    private final UserMapper userMapper;
    private final CandidateResumeReadService candidateResumeReadService;

    @Transactional
    public CandidateProfileResponseDto uploadProfilePhoto(User user, MultipartFile file) {
        String photoUrl = fileStorageService.saveUserPhoto(user.getId(), file);

        user.setAvatarUrl(photoUrl);

        userRepository.save(user);

        return getProfile(user);
    }

    @Transactional
    public CandidateProfileResponseDto updateProfile(User user, CandidateProfileUpdateDto request) {
        CandidateProfile profile = getOrCreateProfile(user);

        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        if (request.getBirthday() != null) {
            profile.setBirthday(request.getBirthday());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().isBlank()
                    ? null
                    : request.getPhoneNumber().trim());
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

        return toDto(profile, true);
    }

    @Transactional
    public CandidateProfileResponseDto getProfile(User user) {
        CandidateProfile profile = getOrCreateProfile(user);

        return toDto(profile, true);
    }

    @Transactional
    public CandidateProfileResponseDto getProfileByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.getRole() == null
                || !"ROLE_USER".equals(user.getRole().getId())) {
            throw new UserNotFoundException("Candidate not found");
        }

        CandidateProfile profile = getOrCreateProfile(user);

        return toDto(profile, false);
    }

    @Transactional(readOnly = true)
    public Page<CandidateApplicationHistoryDto> getApplicationHistory(User user, Pageable pageable) {
        return applicationRepository.findAllByCandidateIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(application -> {
                    Vacancy vacancy = application.getVacancy();
                    VacancyDirection direction = vacancy.getDirection();

                    return new CandidateApplicationHistoryDto(
                            application.getId(),
                            vacancy.getPublicId(),
                            vacancy.getTitle(),
                            direction != null ? direction.getId() : null,
                            direction != null ? direction.getName() : null,
                            vacancy.getCity(),
                            vacancy.getSalaryFrom(),
                            vacancy.getSalaryTo(),
                            vacancy.getCurrency(),
                            vacancy.getEmployment(),
                            vacancy.getExperience(),
                            vacancy.getWorkFormat(),
                            toApplicationEmployerDto(vacancy.getEmployer()),
                            application.getStatus().name(),
                            application.getStatus() != VacancyApplicationStatus.PENDING,
                            application.getCreatedAt(),
                            application.getUpdatedAt()
                    );
                });
    }

    private CandidateApplicationEmployerDto toApplicationEmployerDto(User employer) {
        EmployerDto employerDto = userMapper.toDto(employer);

        if (employerDto == null) {
            return null;
        }

        return new CandidateApplicationEmployerDto(
                employerDto.getId(),
                employerDto.getCompanyName(),
                employerDto.getCity(),
                employerDto.getAvatarUrl()
        );
    }

    private CandidateProfileResponseDto toDto(CandidateProfile profile, boolean includeArchivedResumes) {
        User user = profile.getUser();
        Set<KeySkillDto> skills = profile.getSkills() == null
                ? Collections.emptySet()
                : profile.getSkills().stream()
                .filter(Objects::nonNull)
                .map(skill -> new KeySkillDto(skill.getId(), skill.getName()))
                .collect(Collectors.toSet());
        List<CandidateResumeResponseDto> resumes = candidateResumeReadService.getResumesByUserId(
                user.getId(),
                includeArchivedResumes
        );

        return CandidateProfileResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .birthday(profile.getBirthday())
                .city(null)
                .avatarUrl(user.getAvatarUrl())
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
                .resumes(resumes)
                .build();
    }

    @Transactional
    public CandidateProfile getOrCreateProfile(User user) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder()
                        .user(user)
                        .build());

        if (profile.getId() == null) {
            return candidateProfileRepository.save(profile);
        }

        return profile;
    }
}
