package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.dto.UserRegisterDto;
import com.diplom.internhubbackend.dto.hh.EmployerDto;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User fromDto(UserRegisterDto userDto) {
        return createUser(userDto);
    }

    public EmployerDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return EmployerDto.builder()
                .city(user.getCity())
                .companyName(user.getCompanyName())
                .role(user.getRole())
                .isAggregated(user.getIsAggregated())
                .verified(user.getVerified())
                .verificationStatus(user.getVerificationStatus())
                .verifiedAt(user.getVerifiedAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private static User createUser(final UserRegisterDto userDto) {
        return new User(userDto.getEmail(), userDto.getPassword());
    }
}
