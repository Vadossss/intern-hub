package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.ApplicationDto;
import com.diplom.internhubbackend.dto.ApplyRequestDto;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.ApplicationMapper;
import com.diplom.internhubbackend.models.Application;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.repositories.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApplicationService {
    private final VacancyService vacancyService;
    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;

    public ApplicationDto apply(User user, String publicVacancyId, ApplyRequestDto applyRequestDto) {
        Vacancy vacancy = vacancyService.getActiveVacancy(publicVacancyId);

        if (vacancy == null) {
            throw new VacancyNotFoundException("Vacancy not found");
        }

        if (applicationRepository.existsByCandidateIdAndVacancyId(user.getId(), vacancy.getId())) {
            throw new VacancyNotFoundException("Application already exists");
        }

        Application application = Application
                .builder()
                .candidate(user)
                .vacancy(vacancy)
                .chosenContactMethod(applyRequestDto.chosenContactMethod())
                .coverLetter(applyRequestDto.coverLetter())
                .build();

        applicationRepository.save(application);

        return applicationMapper.toDto(application);
    }
}
