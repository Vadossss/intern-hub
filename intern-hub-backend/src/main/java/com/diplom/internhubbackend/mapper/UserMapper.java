package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.dto.UserRegisterDto;
import com.diplom.internhubbackend.dto.hh.EmployerDto;
import com.diplom.internhubbackend.models.EmployerProfile;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {
    private final EmployerProfileRepository employerProfileRepository;

    public User fromDto(UserRegisterDto userDto) {
        return createUser(userDto);
    }

    public EmployerDto toDto(User user) {
        if (user == null) {
            return null;
        }
        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId()).orElse(null);

        return EmployerDto.builder()
                .id(user.getId())
                .city(profile != null && profile.getCity() != null ? profile.getCity() : user.getCity())
                .companyName(profile != null && profile.getCompanyName() != null ? profile.getCompanyName() : user.getCompanyName())
                .avatarUrl(profile != null && profile.getAvatarUrl() != null ? profile.getAvatarUrl() : user.getAvatarUrl())
                .role(user.getRole())
                .isAggregated(user.getIsAggregated())
                .verified(user.getVerified())
                .verificationStatus(user.getVerificationStatus())
                .verifiedAt(user.getVerifiedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private static User createUser(final UserRegisterDto userDto) {
        return User
                .builder()
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .build();
    }
}
