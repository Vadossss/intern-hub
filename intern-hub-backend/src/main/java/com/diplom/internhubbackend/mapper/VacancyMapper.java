package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.dto.VacancyContactDto;
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
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class VacancyMapper {
    private final StackService stackService;
    private final KeySkillService keySkillService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final VacancySourceService vacancySourceService;
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
        dto.setStack(vacancy.getStack() != null ? vacancy.getStack().getName() : null);
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

    public Vacancy fromDto(NewVacancyDto vacancyDto) {
        return createVacancy(vacancyDto);
    }

    private Vacancy createVacancy(final NewVacancyDto vacancyDto) {
        Set<KeySkill> keySkills = keySkillService.
                getAllKeySkillsById(new HashSet<>(vacancyDto.getSkills()));
        Experience experience = experienceService.getExperienceById(vacancyDto.getExperience());
        Employment employment = employmentService.getEmploymentById(vacancyDto.getEmployment());
        Currency currency = currencyService.getCurrencyById(vacancyDto.getSalary().getCurrency());
        WorkFormat workFormat = workFormatService.getWorkFormatById(vacancyDto.getWorkFormat());
        Stack stack = stackService.getStackById(vacancyDto.getStack());
        VacancySource source = vacancySourceService.getVacancySourceByCode(VacancySourceCode.IH.name());

        return Vacancy
                .builder()
                .title(vacancyDto.getTitle())
                .city(vacancyDto.getCity())
                .stack(stack)
                .source(source)
                .salaryFrom(vacancyDto.getSalary().getFrom())
                .salaryTo(vacancyDto.getSalary().getTo())
                .currency(currency)
                .description(vacancyDto.getDescription())
                .employment(employment)
                .experience(experience)
                .workFormat(workFormat)
                .skills(keySkills)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(source.getTtlDays()))
                .build();

//        return new Vacancy(vacancyDto.getTitle(), stack, vacancyDto.getSalary().getFrom(), vacancyDto.getSalary().getTo(),
//                vacancyDto.getCity(), currency, vacancyDto.getDescription(), vacancyDto.getLink(), employment,
//                experience, workFormat, keySkills, LocalDateTime.now());
    }
}
