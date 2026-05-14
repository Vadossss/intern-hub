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
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSearchProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSkillProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeLanguageProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeEducationProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeWorkExperienceProjection;
import com.diplom.internhubbackend.dto.projection.VacancyListProjection;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerCabinetService {
    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateResumeRepository candidateResumeRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final VacancyMapper vacancyMapper;
    private final VacancyDirectionService vacancyDirectionService;
    private final KeySkillService keySkillService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final ViewTrackingService viewTrackingService;

    @Transactional(readOnly = true)
    public Page<VacancyResponseDto> getMyVacancies(User employer, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VacancyListProjection> vacancies = vacancyRepository.findEmployerVacancyListByEmployerId(
                employer.getId(),
                pageable
        );
        Map<Integer, EmployerProfile> employerProfiles = getEmployerProfiles(vacancies.getContent());

        Page<VacancyResponseDto> result = vacancies.map(vacancy -> vacancyMapper.toListDto(vacancy, employerProfiles));
        viewTrackingService.applyVacancyViewCounts(result.getContent());

        return result;
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
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
        if (request.getDirection() != null) {
            vacancy.setDirection(vacancyDirectionService.getOrCreate(request.getDirection()));
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
        Vacancy savedVacancy = vacancyRepository.save(vacancy);

        return getEmployerVacancyListDto(employer.getId(), savedVacancy.getPublicId());
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
    public Page<CandidateResumeSearchResponseDto> searchCandidates(
            String query,
            String city,
            Set<Integer> skillIds,
            int page,
            int size
    ) {
        Set<Integer> normalizedSkillIds = normalizeSkillIds(skillIds);
        boolean skillIdsEmpty = normalizedSkillIds.isEmpty();
        Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size));

        Page<CandidateResumeSearchProjection> resumes = candidateResumeRepository
                .searchCandidateResumes(
                        likePattern(query),
                        likePattern(city),
                        true,
                        skillIdsEmpty ? Set.of(-1) : normalizedSkillIds,
                        skillIdsEmpty,
                        AccountStatus.ACTIVE,
                        pageable
                );

        Map<Long, Set<KeySkillDto>> skillsByResumeId = getSkillsByResumeId(resumes.getContent());
        Map<Long, List<CandidateResumeLanguageDto>> languagesByResumeId = getLanguagesByResumeId(resumes.getContent());
        Map<Long, List<CandidateResumeEducationDto>> educationByResumeId = getEducationByResumeId(resumes.getContent());
        Map<Long, List<CandidateResumeWorkExperienceDto>> workExperienceByResumeId =
                getWorkExperienceByResumeId(resumes.getContent());
        Map<Long, Long> viewCountsByResumeId = viewTrackingService.countResumeViewsByIds(getResumeIds(resumes.getContent()));

        return resumes.map(resume -> toCandidateResumeSearchDto(
                resume,
                skillsByResumeId.getOrDefault(resume.resumeId(), Collections.emptySet()),
                languagesByResumeId.getOrDefault(resume.resumeId(), Collections.emptyList()),
                educationByResumeId.getOrDefault(resume.resumeId(), Collections.emptyList()),
                workExperienceByResumeId.getOrDefault(resume.resumeId(), Collections.emptyList()),
                viewCountsByResumeId.getOrDefault(resume.resumeId(), 0L)
        ));
    }

    @Transactional
    public void recordCandidateResumeView(User viewer, Long resumeId, HttpServletRequest request) {
        Integer ownerUserId = candidateResumeRepository.findOwnerUserIdByResumeId(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        Boolean archived = candidateResumeRepository.findArchivedByResumeId(resumeId)
                .orElse(false);

        viewTrackingService.recordResumeView(resumeId, ownerUserId, archived, viewer, request);
    }

    @Transactional
    public void recordCandidateProfileView(
            User viewer,
            CandidateProfileResponseDto profile,
            HttpServletRequest request
    ) {
        if (profile == null) {
            return;
        }

        viewTrackingService.recordResumeViews(profile.getResumes(), profile.getUserId(), viewer, request);
        viewTrackingService.applyResumeViewCounts(profile.getResumes());
    }

    private Map<Integer, EmployerProfile> getEmployerProfiles(List<VacancyListProjection> vacancies) {
        List<Integer> employerIds = vacancies.stream()
                .map(VacancyListProjection::employerId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (employerIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return employerProfileRepository.findAllByUserIdIn(employerIds).stream()
                .collect(Collectors.toMap(
                        profile -> profile.getUser().getId(),
                        profile -> profile,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
    }

    private VacancyResponseDto getEmployerVacancyListDto(Integer employerId, String publicId) {
        VacancyListProjection vacancy = vacancyRepository
                .findEmployerVacancyListByPublicIdAndEmployerId(publicId.toLowerCase(), employerId)
                .orElseThrow(() -> new VacancyNotFoundException("Vacancy not found"));
        Map<Integer, EmployerProfile> employerProfiles = getEmployerProfiles(List.of(vacancy));

        VacancyResponseDto dto = vacancyMapper.toListDto(vacancy, employerProfiles);
        dto.setViewCount(viewTrackingService.countVacancyViews(vacancy.id()));

        return dto;
    }

    private Map<Long, Set<KeySkillDto>> getSkillsByResumeId(List<CandidateResumeSearchProjection> resumes) {
        List<Long> resumeIds = resumes.stream()
                .map(CandidateResumeSearchProjection::resumeId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findSkillDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeSkillProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(
                                skill -> new KeySkillDto(skill.skillId(), skill.skillName()),
                                Collectors.toSet()
                        )
                ));
    }

    private Map<Long, List<CandidateResumeLanguageDto>> getLanguagesByResumeId(
            List<CandidateResumeSearchProjection> resumes
    ) {
        List<Long> resumeIds = getResumeIds(resumes);
        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findLanguageDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeLanguageProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(
                                language -> CandidateResumeLanguageDto.builder()
                                        .id(language.id())
                                        .languageId(language.languageId())
                                        .languageName(language.languageName())
                                        .level(language.level())
                                        .build(),
                                Collectors.toList()
                        )
                ));
    }

    private Map<Long, List<CandidateResumeEducationDto>> getEducationByResumeId(
            List<CandidateResumeSearchProjection> resumes
    ) {
        List<Long> resumeIds = getResumeIds(resumes);
        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findEducationDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeEducationProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(
                                education -> CandidateResumeEducationDto.builder()
                                        .id(education.id())
                                        .institution(education.institution())
                                        .specialty(education.specialty())
                                        .educationLevel(education.educationLevel())
                                        .startDate(education.startDate())
                                        .endDate(education.endDate())
                                        .currentlyStudying(Boolean.TRUE.equals(education.currentlyStudying()))
                                        .build(),
                                Collectors.toList()
                        )
                ));
    }

    private Map<Long, List<CandidateResumeWorkExperienceDto>> getWorkExperienceByResumeId(
            List<CandidateResumeSearchProjection> resumes
    ) {
        List<Long> resumeIds = getResumeIds(resumes);
        if (resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return candidateResumeRepository.findWorkExperienceDtosByResumeIds(resumeIds).stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeWorkExperienceProjection::resumeId,
                        LinkedHashMap::new,
                        Collectors.mapping(
                                workExperience -> CandidateResumeWorkExperienceDto.builder()
                                        .id(workExperience.id())
                                        .company(workExperience.company())
                                        .position(workExperience.position())
                                        .workFormatId(workExperience.workFormatId())
                                        .workFormatName(workExperience.workFormatName())
                                        .startDate(workExperience.startDate())
                                        .endDate(workExperience.endDate())
                                        .currentlyWorking(Boolean.TRUE.equals(workExperience.currentlyWorking()))
                                        .projectUrl(workExperience.projectUrl())
                                        .build(),
                                Collectors.toList()
                        )
                ));
    }

    private List<Long> getResumeIds(List<CandidateResumeSearchProjection> resumes) {
        return resumes.stream()
                .map(CandidateResumeSearchProjection::resumeId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private CandidateResumeSearchResponseDto toCandidateResumeSearchDto(
            CandidateResumeSearchProjection candidate,
            Set<KeySkillDto> skills,
            List<CandidateResumeLanguageDto> languages,
            List<CandidateResumeEducationDto> education,
            List<CandidateResumeWorkExperienceDto> workExperience,
            Long viewCount
    ) {
        CandidateResumeResponseDto resume = CandidateResumeResponseDto.builder()
                .id(candidate.resumeId())
                .profession(candidate.profession())
                .city(candidate.city())
                .expectedSalaryFrom(candidate.expectedSalaryFrom())
                .expectedSalaryTo(candidate.expectedSalaryTo())
                .employmentId(candidate.employmentId())
                .employmentName(candidate.employmentName())
                .workFormatId(candidate.workFormatId())
                .workFormatName(candidate.workFormatName())
                .experienceId(candidate.experienceId())
                .experienceName(candidate.experienceName())
                .about(candidate.resumeAbout())
                .archived(Boolean.TRUE.equals(candidate.archived()))
                .skills(skills)
                .languages(languages)
                .education(education)
                .workExperience(workExperience)
                .viewCount(viewCount == null ? 0L : viewCount)
                .createdAt(candidate.createdAt())
                .updatedAt(candidate.updatedAt())
                .build();

        return CandidateResumeSearchResponseDto.builder()
                .profileId(candidate.profileId())
                .userId(candidate.userId())
                .email(candidate.email())
                .phoneNumber(candidate.phoneNumber())
                .firstName(candidate.firstName())
                .lastName(candidate.lastName())
                .birthday(candidate.birthday())
                .avatarUrl(candidate.avatarUrl())
                .about(candidate.profileAbout())
                .resumeUrl(candidate.resumeUrl())
                .portfolioUrl(candidate.portfolioUrl())
                .openToWork(candidate.openToWork())
                .resume(resume)
                .build();
    }

    private EmployerApplicationResponseDto toEmployerApplicationDto(Application application) {
        User candidate = application.getCandidate();
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(candidate.getId()).orElse(null);
        String firstName = candidateProfile != null ? candidateProfile.getFirstName() : null;
        String lastName = candidateProfile != null ? candidateProfile.getLastName() : null;
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
