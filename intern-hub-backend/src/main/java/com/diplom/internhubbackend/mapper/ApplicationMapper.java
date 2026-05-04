package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.Application;
import com.diplom.internhubbackend.dto.ApplicationDto;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {
    public ApplicationDto toDto(Application entity) {
        return new ApplicationDto(
                entity.getId(),
                entity.getVacancy().getPublicId(),
                entity.getCandidate().getId(),
                entity.getStatus().name());
    }
}
