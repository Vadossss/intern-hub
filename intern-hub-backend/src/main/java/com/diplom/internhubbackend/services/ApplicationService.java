package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.ApplicationDto;
import com.diplom.internhubbackend.dto.ApplicationStatusDto;
import com.diplom.internhubbackend.dto.ApplyRequestDto;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.ApplicationMapper;
import com.diplom.internhubbackend.models.Application;
import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.repositories.ApplicationRepository;
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApplicationService {
    private final VacancyService vacancyService;
    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;
    private final CandidateResumeRepository candidateResumeRepository;

    public ApplicationDto apply(User user, String publicVacancyId, ApplyRequestDto applyRequestDto) {
        Vacancy vacancy = vacancyService.getActiveVacancy(publicVacancyId);

        if (vacancy == null) {
            throw new VacancyNotFoundException("Vacancy not found");
        }

        if (applicationRepository.existsByCandidateIdAndVacancyId(user.getId(), vacancy.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application already exists");
        }

        CandidateResume resume = resolveResume(user, applyRequestDto.resumeId());

        Application application = Application
                .builder()
                .candidate(user)
                .vacancy(vacancy)
                .resume(resume)
                .chosenContactMethod(applyRequestDto.chosenContactMethod())
                .coverLetter(applyRequestDto.coverLetter())
                .resumeUrl(applyRequestDto.resumeUrl())
                .build();

        try {
            applicationRepository.save(application);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application already exists", exception);
        }

        return applicationMapper.toDto(application);
    }

    public ApplicationStatusDto getApplicationStatus(User user, String publicVacancyId) {
        return applicationRepository
                .findFirstByCandidateIdAndVacancyPublicIdOrderByCreatedAtDesc(user.getId(), publicVacancyId)
                .map(application -> new ApplicationStatusDto(
                        true,
                        application.getId(),
                        application.getStatus().name(),
                        application.getResume() == null ? null : application.getResume().getId()
                ))
                .orElseGet(() -> new ApplicationStatusDto(false, null, null, null));
    }

    private CandidateResume resolveResume(User user, Long resumeId) {
        if (candidateResumeRepository.countActiveByUserId(user.getId()) < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Active resume is required to apply");
        }

        if (resumeId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume is required to apply");
        }

        CandidateResume resume = candidateResumeRepository
                .findByIdAndCandidateProfile_User_Id(resumeId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume not found"));

        if (Boolean.TRUE.equals(resume.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Active resume is required to apply");
        }

        return resume;
    }
}
