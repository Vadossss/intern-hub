package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.EmployerProfileResponseDto;
import com.diplom.internhubbackend.dto.EmployerProfileUpdateDto;
import com.diplom.internhubbackend.dto.aggregation.AggregatedEmployerData;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.UserRole;
import com.diplom.internhubbackend.enums.VerificationStatus;
import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.EmployerSource;
import com.diplom.internhubbackend.models.EmployerProfile;
import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.repositories.EmployerSourceRepository;
import com.diplom.internhubbackend.repositories.UserRepository;
import com.diplom.internhubbackend.repositories.VacancySourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class EmployerProfileService {
    private final EmployerProfileRepository employerProfileRepository;
    private final EmployerSourceRepository employerSourceRepository;
    private final UserRepository userRepository;
    private final VacancySourceRepository vacancySourceRepository;
    private final UserRoleService userRoleService;
    private final FileStorageService fileStorageService;

    @Transactional
    public EmployerProfileResponseDto getProfile(User user) {
        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> employerProfileRepository.save(buildFromUser(user)));

        return toDto(profile);
    }

    @Transactional
    public EmployerProfileResponseDto getProfileByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Employer not found"));

        if (user.getRole() == null
                || !"ROLE_EMPLOYER".equals(user.getRole().getId())) {
            throw new UserNotFoundException("Employer not found");
        }
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new AccessDeniedException("У вас нет доступа к этому работодателю");
        }

        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> employerProfileRepository.save(buildFromUser(user)));

        return toDto(profile);
    }

    @Transactional(readOnly = true)
    public Page<EmployerProfileResponseDto> searchPublicProfiles(String query, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        String normalizedQuery = normalizeSearchQuery(query);

        return userRepository.searchPublicEmployers(
                        AccountStatus.ACTIVE,
                        normalizedQuery,
                        PageRequest.of(safePage, safeSize)
                )
                .map(this::toPublicDto);
    }

    @Transactional
    public EmployerProfileResponseDto updateProfile(User user, EmployerProfileUpdateDto request) {
        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> buildFromUser(user));

        if (request.getCompanyName() != null) {
            profile.setCompanyName(request.getCompanyName());
        }
        if (request.getCity() != null) {
            profile.setCity(request.getCity());
        }
        if (request.getWebsite() != null) {
            profile.setWebsite(request.getWebsite());
        }
        if (request.getContactName() != null) {
            profile.setContactName(request.getContactName());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getAbout() != null) {
            profile.setAbout(request.getAbout());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);
        employerProfileRepository.save(profile);

        return toDto(profile);
    }

    @Transactional
    public EmployerProfileResponseDto uploadProfilePhoto(User user, MultipartFile file) {
        String photoUrl = fileStorageService.saveCompanyPhoto(user.getId(), file);

        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> buildFromUser(user));
        profile.setAvatarUrl(photoUrl);
        user.setAvatarUrl(photoUrl);

        userRepository.save(user);
        employerProfileRepository.save(profile);

        return toDto(profile);
    }

    @Transactional
    public EmployerProfile ensureAggregatedEmployerProfile(User user, String companyName, String avatarUrl) {
        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> EmployerProfile.builder()
                        .user(user)
                        .companyName(companyName)
                        .avatarUrl(avatarUrl)
                        .aggregated(true)
                        .build());

        if (isBlank(profile.getCompanyName()) && !isBlank(companyName)) {
            profile.setCompanyName(companyName);
        }
        if (isBlank(profile.getAvatarUrl()) && !isBlank(avatarUrl)) {
            profile.setAvatarUrl(avatarUrl);
            user.setAvatarUrl(avatarUrl);
        }
        profile.setAggregated(true);

        userRepository.save(user);
        return employerProfileRepository.save(profile);
    }

    @Transactional
    public User resolveAggregatedEmployer(AggregatedEmployerData data) {
        if (data == null) {
            return null;
        }

        String sourceCode = trimToNull(data.sourceCode());
        String externalId = trimToNull(data.externalId());

        User existingEmployer = findEmployerBySource(sourceCode, externalId);
        if (existingEmployer != null) {
            return existingEmployer;
        }

        if (isBlank(data.companyName())) {
            return null;
        }

        VacancySource source = sourceCode == null
                ? null
                : vacancySourceRepository.findByCode(sourceCode).orElse(null);

        EmployerProfile profile = findProfileBySource(sourceCode, externalId)
                .or(() -> employerProfileRepository.findByCompanyNameIgnoreCase(data.companyName().trim()))
                .orElseGet(() -> employerProfileRepository.save(buildAggregatedProfile(data)));

        mergeAggregatedProfile(profile, data);
        User user = profile.getUser();
        if (user.getStatus() == null) {
            user.setStatus(AccountStatus.ACTIVE);
        }
        user.setAvatarUrl(firstNonBlank(profile.getAvatarUrl(), user.getAvatarUrl()));
        Boolean mergedVerified = firstNonNull(profile.getVerified(), user.getVerified());
        user.setVerified(Boolean.TRUE.equals(mergedVerified));
        if (Boolean.TRUE.equals(mergedVerified)) {
            user.setVerificationStatus(VerificationStatus.CONFIRMED);
        }

        userRepository.save(user);
        EmployerProfile savedProfile = employerProfileRepository.save(profile);

        if (source != null && externalId != null) {
            saveEmployerSource(savedProfile, source, externalId, data);
        }

        return user;
    }

    private User findEmployerBySource(String sourceCode, String externalId) {
        if (isBlank(sourceCode) || isBlank(externalId)) {
            return null;
        }

        return employerSourceRepository
                .findExistingEmployer(sourceCode, externalId)
                .map(EmployerSource::getEmployerProfile)
                .map(EmployerProfile::getUser)
                .orElse(null);
    }

    private EmployerProfile buildFromUser(User user) {
        return EmployerProfile.builder()
                .user(user)
                .avatarUrl(user.getAvatarUrl())
                .aggregated(false)
                .verified(user.getVerified())
                .build();
    }

    private EmployerProfile buildAggregatedProfile(AggregatedEmployerData data) {
        Role companyRole = userRoleService.findRoleById(UserRole.ROLE_EMPLOYER.name());
        Boolean verified = Boolean.TRUE.equals(data.verified());

        User user = User.builder()
                .avatarUrl(trimToNull(data.avatarUrl()))
                .verified(verified)
                .verificationStatus(verified ? VerificationStatus.CONFIRMED : VerificationStatus.EXPECTATION)
                .status(AccountStatus.ACTIVE)
                .role(companyRole)
                .build();

        userRepository.save(user);

        return EmployerProfile.builder()
                .user(user)
                .companyName(trimToNull(data.companyName()))
                .city(trimToNull(data.city()))
                .website(trimToNull(data.website()))
                .about(trimToNull(data.description()))
                .avatarUrl(trimToNull(data.avatarUrl()))
                .aggregated(true)
                .verified(verified)
                .accredited(data.accredited())
                .build();
    }

    private java.util.Optional<EmployerProfile> findProfileBySource(String sourceCode, String externalId) {
        if (isBlank(sourceCode) || isBlank(externalId)) {
            return java.util.Optional.empty();
        }

        return employerSourceRepository
                .findBySource_CodeAndExternalId(sourceCode, externalId)
                .map(EmployerSource::getEmployerProfile);
    }

    private void mergeAggregatedProfile(EmployerProfile profile, AggregatedEmployerData data) {
        if (isBlank(profile.getCompanyName()) && !isBlank(data.companyName())) {
            profile.setCompanyName(data.companyName().trim());
        }
        if (isBlank(profile.getCity()) && !isBlank(data.city())) {
            profile.setCity(data.city().trim());
        }
        if (isBlank(profile.getWebsite()) && !isBlank(data.website())) {
            profile.setWebsite(data.website().trim());
        }
        if (isBlank(profile.getAbout()) && !isBlank(data.description())) {
            profile.setAbout(data.description().trim());
        }
        if (isBlank(profile.getAvatarUrl()) && !isBlank(data.avatarUrl())) {
            profile.setAvatarUrl(data.avatarUrl().trim());
        }
        profile.setAggregated(true);

        if (profile.getAccredited() == null || Boolean.TRUE.equals(data.accredited())) {
            profile.setAccredited(data.accredited());
        }
        if (profile.getVerified() == null || Boolean.TRUE.equals(data.verified())) {
            profile.setVerified(data.verified());
        }
    }

    private void saveEmployerSource(
            EmployerProfile profile,
            VacancySource source,
            String externalId,
            AggregatedEmployerData data
    ) {
        EmployerSource employerSource = employerSourceRepository
                .findBySource_CodeAndExternalId(source.getCode(), externalId)
                .orElseGet(() -> EmployerSource.builder()
                        .employerProfile(profile)
                        .source(source)
                        .externalId(externalId)
                        .build());

        employerSource.setEmployerProfile(profile);
        employerSource.setSourceName(firstNonBlank(data.companyName(), employerSource.getSourceName()));
        employerSource.setSourceUrl(firstNonBlank(data.sourceUrl(), employerSource.getSourceUrl()));

        employerSourceRepository.save(employerSource);
    }

    private EmployerProfileResponseDto toPublicDto(User user) {
        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> buildFromUser(user));

        return toDto(profile);
    }

    private EmployerProfileResponseDto toDto(EmployerProfile profile) {
        User user = profile.getUser();

        return EmployerProfileResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .companyName(profile.getCompanyName())
                .city(profile.getCity())
                .website(profile.getWebsite())
                .contactName(profile.getContactName())
                .phone(profile.getPhone())
                .about(profile.getAbout())
                .avatarUrl(firstNonBlank(profile.getAvatarUrl(), user.getAvatarUrl()))
                .aggregated(profile.getAggregated())
                .accredited(profile.getAccredited())
                .verified(firstNonNull(profile.getVerified(), user.getVerified()))
                .verificationStatus(user.getVerificationStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private Boolean firstNonNull(Boolean value, Boolean fallback) {
        return value != null ? value : fallback;
    }

    private String firstNonBlank(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private String normalizeSearchQuery(String query) {
        if (isBlank(query)) {
            return null;
        }

        return "%" + query.trim().toLowerCase() + "%";
    }
}
