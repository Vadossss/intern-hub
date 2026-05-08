package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.EmployerProfileResponseDto;
import com.diplom.internhubbackend.dto.EmployerProfileUpdateDto;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.EmployerProfile;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class EmployerProfileService {
    private final EmployerProfileRepository employerProfileRepository;
    private final UserRepository userRepository;
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
            user.setCompanyName(request.getCompanyName());
        }
        if (request.getCity() != null) {
            profile.setCity(request.getCity());
            user.setCity(request.getCity());
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
                        .build());

        if (isBlank(profile.getCompanyName()) && !isBlank(companyName)) {
            profile.setCompanyName(companyName);
        }
        if (isBlank(profile.getAvatarUrl()) && !isBlank(avatarUrl)) {
            profile.setAvatarUrl(avatarUrl);
            user.setAvatarUrl(avatarUrl);
        }
        if (!isBlank(companyName) && isBlank(user.getCompanyName())) {
            user.setCompanyName(companyName);
        }

        userRepository.save(user);
        return employerProfileRepository.save(profile);
    }

    private EmployerProfile buildFromUser(User user) {
        return EmployerProfile.builder()
                .user(user)
                .companyName(user.getCompanyName())
                .city(user.getCity())
                .avatarUrl(user.getAvatarUrl())
                .build();
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
                .companyName(firstNonBlank(profile.getCompanyName(), user.getCompanyName()))
                .city(firstNonBlank(profile.getCity(), user.getCity()))
                .website(profile.getWebsite())
                .contactName(profile.getContactName())
                .phone(profile.getPhone())
                .about(profile.getAbout())
                .avatarUrl(firstNonBlank(profile.getAvatarUrl(), user.getAvatarUrl()))
                .verified(user.getVerified())
                .verificationStatus(user.getVerificationStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private String firstNonBlank(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizeSearchQuery(String query) {
        if (isBlank(query)) {
            return null;
        }

        return "%" + query.trim().toLowerCase() + "%";
    }
}
