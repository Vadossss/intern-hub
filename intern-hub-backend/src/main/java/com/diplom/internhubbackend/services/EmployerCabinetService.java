package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.*;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.enums.VacancyApplicationStatus;
import com.diplom.internhubbackend.exception.ResourceNotFoundException;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.repositories.ApplicationRepository;
import com.diplom.internhubbackend.repositories.CandidateProfileRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerCabinetService {
    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final VacancyMapper vacancyMapper;
    private final StackService stackService;
    private final KeySkillService keySkillService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final CandidateProfileService candidateProfileService;

    @Transactional(readOnly = true)
    public Page<VacancyResponseDto> getMyVacancies(User employer, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return vacancyRepository.findAllByEmployerIdOrderByCreatedAtDesc(employer.getId(), pageable)
                .map(vacancyMapper::toDto);
    }

    @Transactional
    public VacancyResponseDto updateVacancy(User employer, String vacancyPublicId, NewVacancyDto request) {
        Vacancy vacancy = vacancyRepository.findByPublicIdAndEmployerId(vacancyPublicId.toLowerCase(), employer.getId())
                .orElseThrow(() -> new VacancyNotFoundException("Vacancy not found"));

        if (request.getTitle() != null) {
            vacancy.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            vacancy.setDescription(request.getDescription());
        }
        if (request.getCity() != null) {
            vacancy.setCity(request.getCity());
        }
        if (request.getStack() != null) {
            vacancy.setStack(stackService.getStackById(request.getStack()));
        }
        if (request.getEmployment() != null) {
            vacancy.setEmployment(employmentService.getEmploymentById(request.getEmployment()));
        }
        if (request.getExperience() != null) {
            vacancy.setExperience(experienceService.getExperienceById(request.getExperience()));
        }
        if (request.getWorkFormat() != null) {
            vacancy.setWorkFormat(workFormatService.getWorkFormatById(request.getWorkFormat()));
        }

        if (request.getSalary() != null) {
            vacancy.setSalaryFrom(request.getSalary().getFrom());
            vacancy.setSalaryTo(request.getSalary().getTo());
            if (request.getSalary().getCurrency() != null) {
                vacancy.setCurrency(currencyService.getCurrencyById(request.getSalary().getCurrency()));
            }
        }

        if (request.getSkills() != null) {
            Set<KeySkill> skills = keySkillService.getAllKeySkillsById(request.getSkills());
            vacancy.setSkills(skills);
        }

        if (request.getContactsList() != null) {
            validateSingleInternalContact(request);
            List<VacancyContact> contacts = request.getContactsList().stream().map(contact -> VacancyContact
                    .builder()
                    .vacancy(vacancy)
                    .method(contact.chosenContactMethod())
                    .value(contact.contactValue())
                    .hint(contact.hint())
                    .build()
            ).collect(Collectors.toList());
            vacancy.getContacts().clear();
            vacancy.getContacts().addAll(contacts);
        }

        vacancy.setUpdatedAt(LocalDateTime.now());
        vacancyRepository.save(vacancy);

        return vacancyMapper.toDto(vacancy);
    }

    private void validateSingleInternalContact(NewVacancyDto request) {
        long internalContacts = request.getContactsList().stream()
                .filter(contact -> contact.chosenContactMethod() == ContactMethod.INTERNAL_CHAT)
                .count();

        if (internalContacts > 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only one internal apply contact is allowed"
            );
        }
    }

    @Transactional(readOnly = true)
    public Page<EmployerApplicationResponseDto> getVacancyApplications(
            User employer,
            String vacancyPublicId,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        return applicationRepository
                .findAllByVacancyPublicIdAndVacancyEmployerId(vacancyPublicId.toLowerCase(), employer.getId(), pageable)
                .map(this::toEmployerApplicationDto);
    }

    @Transactional
    public EmployerApplicationResponseDto updateApplicationStatus(
            User employer,
            Long applicationId,
            VacancyApplicationStatus status
    ) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Application status is required");
        }

        Application application = applicationRepository.findByIdAndVacancyEmployerId(applicationId, employer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setStatus(status);
        application.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(application);

        return toEmployerApplicationDto(application);
    }

    @Transactional(readOnly = true)
    public Page<CandidateProfileResponseDto> searchCandidates(
            String query,
            String city,
            Boolean openToWork,
            Set<Integer> skillIds,
            int page,
            int size
    ) {
        Set<Integer> normalizedSkillIds = normalizeSkillIds(skillIds);
        boolean skillIdsEmpty = normalizedSkillIds.isEmpty();
        Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size));

        return candidateProfileRepository
                .searchCandidates(
                        likePattern(query),
                        likePattern(city),
                        openToWork,
                        skillIdsEmpty ? Set.of(-1) : normalizedSkillIds,
                        skillIdsEmpty,
                        AccountStatus.ACTIVE,
                        pageable
                )
                .map(candidateProfile ->
                        candidateProfileService.getProfileByUserId(candidateProfile.getUser().getId())
                );
    }

    private EmployerApplicationResponseDto toEmployerApplicationDto(Application application) {
        User candidate = application.getCandidate();
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(candidate.getId()).orElse(null);
        String firstName = candidateProfile != null && candidateProfile.getFirstName() != null
                ? candidateProfile.getFirstName()
                : candidate.getFirstName();
        String lastName = candidateProfile != null && candidateProfile.getLastName() != null
                ? candidateProfile.getLastName()
                : candidate.getLastName();
        String candidateName = (firstName == null ? "" : firstName) +
                (lastName == null ? "" : " " + lastName);

        return new EmployerApplicationResponseDto(
                application.getId(),
                application.getVacancy().getPublicId(),
                candidate.getId(),
                candidateName.trim().isEmpty() ? null : candidateName.trim(),
                candidate.getEmail(),
                application.getStatus().name(),
                application.getStatus() != VacancyApplicationStatus.PENDING,
                application.getCoverLetter(),
                application.getResumeUrl(),
                application.getResume() == null ? null : application.getResume().getId(),
                application.getResume() == null ? null : application.getResume().getProfession(),
                application.getChosenContactMethod() == null ? null : application.getChosenContactMethod().name(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }

    private int normalizePage(int page) {
        return Math.max(page, 0);
    }

    private int normalizeSize(int size) {
        if (size < 1) {
            return 20;
        }

        return Math.min(size, 50);
    }

    private String likePattern(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return "%" + value.trim().toLowerCase() + "%";
    }

    private Set<Integer> normalizeSkillIds(Set<Integer> skillIds) {
        if (skillIds == null || skillIds.isEmpty()) {
            return Set.of();
        }

        return skillIds.stream()
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toSet());
    }
}
