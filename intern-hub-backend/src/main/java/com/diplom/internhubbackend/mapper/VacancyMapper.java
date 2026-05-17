package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.dto.VacancyContactDto;
import com.diplom.internhubbackend.dto.hh.EmployerDto;
import com.diplom.internhubbackend.dto.projection.VacancyListProjection;
import com.diplom.internhubbackend.dto.projection.VacancyProjection;
import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.dto.NewVacancyDto;
import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.enums.VacancySourceCode;
import com.diplom.internhubbackend.services.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class VacancyMapper {
    private final KeySkillService keySkillService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final VacancySourceService vacancySourceService;
    private final VacancyDirectionService vacancyDirectionService;
    private final UserMapper userMapper;


    public VacancyResponseDto toDto(Vacancy vacancy) {
        VacancyResponseDto dto = new VacancyResponseDto();
        dto.setId(vacancy.getId());
        dto.setPublicId(vacancy.getPublicId());
        dto.setTitle(vacancy.getTitle());
        dto.setSalaryFrom(vacancy.getSalaryFrom());
        dto.setSalaryTo(vacancy.getSalaryTo());
        dto.setCurrency(vacancy.getCurrency());
        dto.setDescription(vacancy.getDescription());
        dto.setEmployment(vacancy.getEmployment());
        dto.setExperience(vacancy.getExperience());
        dto.setWorkFormat(vacancy.getWorkFormat());
        dto.setCity(vacancy.getCity());
        dto.setEmployer(userMapper.toDto(vacancy.getEmployer()));
        dto.setDirectionId(vacancy.getDirection() != null ? vacancy.getDirection().getId() : null);
        dto.setDirection(vacancy.getDirection() != null ? vacancy.getDirection().getName() : null);
        dto.setStatus(vacancy.getStatus());
        dto.setContacts(
                vacancy.getContacts().stream()
                        .map(contact -> new VacancyContactDto(contact.getMethod(),
                                contact.getValue(), contact.getHint()))
                        .collect(Collectors.toList())
        );

        dto.setSkills(
                (vacancy.getSkills() != null ? vacancy.getSkills() : Collections.<KeySkill>emptySet()).stream()
                        .map(skill -> new KeySkillDto(skill.getId(), skill.getName()))
                        .collect(Collectors.toSet())
        );

        return dto;
    }

    public List<VacancyResponseDto> toDto(List<Vacancy> vacancies) {
        return vacancies.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public VacancyResponseDto toListDto(
            VacancyListProjection vacancy,
            Map<Integer, EmployerProfile> employerProfilesByUserId
    ) {
        VacancyResponseDto dto = new VacancyResponseDto();
        dto.setId(vacancy.id());
        dto.setPublicId(vacancy.publicId());
        dto.setTitle(vacancy.title());
        dto.setSalaryFrom(vacancy.salaryFrom());
        dto.setSalaryTo(vacancy.salaryTo());
        dto.setCurrency(vacancy.currency());
        dto.setEmployment(vacancy.employment());
        dto.setExperience(vacancy.experience());
        dto.setWorkFormat(vacancy.workFormat());
        dto.setCity(vacancy.city());
        dto.setDirectionId(vacancy.directionId());
        dto.setDirection(vacancy.direction());
        dto.setStatus(vacancy.status());
        dto.setContacts(Collections.emptyList());
        dto.setSkills(Collections.emptySet());
        dto.setEmployer(toEmployerDto(vacancy, employerProfilesByUserId));

        return dto;
    }

    public List<VacancyResponseDto> toListDto(
            List<VacancyListProjection> vacancies,
            Map<Integer, EmployerProfile> employerProfilesByUserId
    ) {
        return vacancies.stream()
                .map(vacancy -> toListDto(vacancy, employerProfilesByUserId))
                .collect(Collectors.toList());
    }

    public VacancyResponseDto toDto(
            VacancyProjection vacancy,
            Set<KeySkillDto> skills,
            List<VacancyContactDto> contacts
    ) {
        VacancyResponseDto dto = new VacancyResponseDto();
        dto.setId(vacancy.id());
        dto.setPublicId(vacancy.publicId());
        dto.setTitle(vacancy.title());
        dto.setSalaryFrom(vacancy.salaryFrom());
        dto.setSalaryTo(vacancy.salaryTo());
        dto.setCurrency(vacancy.currency());
        dto.setDescription(vacancy.description());
        dto.setEmployment(vacancy.employment());
        dto.setExperience(vacancy.experience());
        dto.setWorkFormat(vacancy.workFormat());
        dto.setCity(vacancy.city());
        dto.setDirectionId(vacancy.directionId());
        dto.setDirection(vacancy.direction());
        dto.setStatus(vacancy.status());
        dto.setSkills(skills == null ? Collections.emptySet() : skills);
        dto.setContacts(contacts == null ? Collections.emptyList() : contacts);
        dto.setEmployer(toEmployerDto(vacancy));

        return dto;
    }

    private EmployerDto toEmployerDto(
            VacancyListProjection vacancy,
            Map<Integer, EmployerProfile> employerProfilesByUserId
    ) {
        if (vacancy.employerId() == null) {
            return null;
        }

        EmployerProfile profile = employerProfilesByUserId.get(vacancy.employerId());

        return EmployerDto.builder()
                .id(vacancy.employerId())
                .city(profile != null ? profile.getCity() : null)
                .companyName(profile != null ? profile.getCompanyName() : null)
                .avatarUrl(profile != null && profile.getAvatarUrl() != null
                        ? profile.getAvatarUrl()
                        : vacancy.employerAvatarUrl())
                .isAggregated(profile != null ? profile.getAggregated() : null)
                .accredited(profile != null ? profile.getAccredited() : null)
                .verified(profile != null && profile.getVerified() != null
                        ? profile.getVerified()
                        : vacancy.employerVerified())
                .verificationStatus(vacancy.employerVerificationStatus())
                .verifiedAt(vacancy.employerVerifiedAt())
                .createdAt(vacancy.employerCreatedAt())
                .updatedAt(vacancy.employerUpdatedAt())
                .build();
    }

    private EmployerDto toEmployerDto(VacancyProjection vacancy) {
        if (vacancy.employerId() == null) {
            return null;
        }

        return EmployerDto.builder()
                .id(vacancy.employerId())
                .city(vacancy.employerCity())
                .companyName(vacancy.employerCompanyName())
                .avatarUrl(vacancy.employerAvatarUrl())
                .isAggregated(vacancy.employerAggregated())
                .accredited(vacancy.employerAccredited())
                .verified(vacancy.employerVerified())
                .verificationStatus(vacancy.employerVerificationStatus())
                .verifiedAt(vacancy.employerVerifiedAt())
                .createdAt(vacancy.employerCreatedAt())
                .updatedAt(vacancy.employerUpdatedAt())
                .build();
    }

    public Vacancy fromDto(NewVacancyDto vacancyDto) {
        VacancySource source = vacancySourceService.getVacancySourceByCode(VacancySourceCode.IH.name());
        return createVacancy(vacancyDto, source);
    }

    public Vacancy fromDto(NewVacancyDto vacancyDto, VacancySource source) {
        return createVacancy(vacancyDto, source);
    }

    private Vacancy createVacancy(final NewVacancyDto vacancyDto, VacancySource source) {
        Set<KeySkill> keySkills = vacancyDto.getSkills() == null
                ? Collections.emptySet()
                : keySkillService.getAllKeySkillsById(new HashSet<>(vacancyDto.getSkills()));
        Experience experience = experienceService.getExperienceById(vacancyDto.getExperience());
        Employment employment = employmentService.getEmploymentById(vacancyDto.getEmployment());
        NewVacancyDto.Salary salary = vacancyDto.getSalary();
        Currency currency = currencyService.getCurrencyById(
                salary == null || salary.getCurrency() == null || salary.getCurrency().isBlank()
                        ? "RUR"
                        : salary.getCurrency()
        );
        WorkFormat workFormat = workFormatService.getWorkFormatById(vacancyDto.getWorkFormat());
        VacancyDirection direction = vacancyDirectionService.getOrCreate(vacancyDto.getDirection());

        return Vacancy
                .builder()
                .title(vacancyDto.getTitle())
                .city(vacancyDto.getCity())
                .direction(direction)
                .source(source)
                .salaryFrom(salary == null ? null : salary.getFrom())
                .salaryTo(salary == null ? null : salary.getTo())
                .currency(currency)
                .description(vacancyDto.getDescription())
                .employment(employment)
                .experience(experience)
                .workFormat(workFormat)
                .skills(keySkills)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(source.getTtlDays()))
                .build();
    }
}
