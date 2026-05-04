package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.*;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.VacancyApplicationStatus;
import com.diplom.internhubbackend.exception.ResourceNotFoundException;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.Application;
import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyContact;
import com.diplom.internhubbackend.repositories.ApplicationRepository;
import com.diplom.internhubbackend.repositories.CandidateProfileRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
        Pageable pageable = PageRequest.of(page, size);
        String queryValue = normalizeForLike(query);
        String cityValue = normalizeForLike(city);

        List<CandidateProfileResponseDto> candidates;

        if (skillIds == null || skillIds.isEmpty()) {
            candidates = candidateProfileRepository.searchCandidatesNoSkills(openToWork, AccountStatus.ACTIVE)
                    .stream()
                    .map(candidateProfile -> candidateProfileService.getProfileByUserId(candidateProfile.getUser().getId()))
                    .filter(profile -> matchesCandidate(profile, queryValue, cityValue))
                    .toList();
        } else {
            candidates = candidateProfileRepository.searchCandidatesWithSkills(openToWork, skillIds, AccountStatus.ACTIVE)
                    .stream()
                    .map(candidateProfile -> candidateProfileService.getProfileByUserId(candidateProfile.getUser().getId()))
                    .filter(profile -> matchesCandidate(profile, queryValue, cityValue))
                    .toList();
        }

        int fromIndex = page * size;
        if (fromIndex >= candidates.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, candidates.size());
        }

        int toIndex = Math.min(fromIndex + size, candidates.size());
        List<CandidateProfileResponseDto> paged = candidates.subList(fromIndex, toIndex);

        return new PageImpl<>(paged, pageable, candidates.size());
    }

    private EmployerApplicationResponseDto toEmployerApplicationDto(Application application) {
        User candidate = application.getCandidate();
        String candidateName = (candidate.getFirstName() == null ? "" : candidate.getFirstName()) +
                (candidate.getLastName() == null ? "" : " " + candidate.getLastName());

        return new EmployerApplicationResponseDto(
                application.getId(),
                application.getVacancy().getPublicId(),
                candidate.getId(),
                candidateName.trim().isEmpty() ? null : candidateName.trim(),
                candidate.getEmail(),
                application.getStatus().name(),
                application.getCoverLetter(),
                application.getResumeUrl(),
                application.getChosenContactMethod() == null ? null : application.getChosenContactMethod().name(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }

    private String normalizeForLike(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim();
    }

    private boolean matchesCandidate(CandidateProfileResponseDto profile, String queryValue, String cityValue) {
        if (profile == null) {
            return false;
        }

        boolean cityMatches = cityValue.isBlank()
                || containsIgnoreCase(profile.getCity(), cityValue)
                || containsIgnoreCase(profile.getPreferredCity(), cityValue);

        if (!cityMatches) {
            return false;
        }

        if (queryValue.isBlank()) {
            return true;
        }

        if (containsIgnoreCase(profile.getFirstName(), queryValue)
                || containsIgnoreCase(profile.getLastName(), queryValue)
                || containsIgnoreCase(profile.getEmail(), queryValue)
                || containsIgnoreCase(profile.getAbout(), queryValue)
                || containsIgnoreCase(profile.getPreferredCity(), queryValue)) {
            return true;
        }

        if (profile.getSkills() == null || profile.getSkills().isEmpty()) {
            return false;
        }

        return profile.getSkills().stream()
                .anyMatch(skill -> containsIgnoreCase(skill.getName(), queryValue));
    }

    private boolean containsIgnoreCase(String value, String target) {
        if (value == null || target == null) {
            return false;
        }
        return value.toLowerCase(Locale.ROOT).contains(target.toLowerCase(Locale.ROOT));
    }
}
