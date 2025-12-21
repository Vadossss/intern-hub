package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.models.dto.KeySkillDto;
import com.diplom.internhubbackend.models.dto.NewVacancyDto;
import com.diplom.internhubbackend.models.dto.VacancyResponseDto;
import com.diplom.internhubbackend.repositories.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
public class VacancyMapper {
    private final KeySkillRepository keySkillRepository;
    private final ExperienceRepository experienceRepository;
    private final EmploymentRepository employmentRepository;
    private final WorkFormatRepository workFormatRepository;
    private final CurrencyRepository currencyRepository;
    private final StackRepository stackRepository;

    public VacancyMapper(KeySkillRepository keySkillRepository, ExperienceRepository experienceRepository, EmploymentRepository employmentRepository, WorkFormatRepository workFormatRepository, CurrencyRepository currencyRepository, StackRepository stackRepository) {
        this.keySkillRepository = keySkillRepository;
        this.experienceRepository = experienceRepository;
        this.employmentRepository = employmentRepository;
        this.workFormatRepository = workFormatRepository;
        this.currencyRepository = currencyRepository;
        this.stackRepository = stackRepository;
    }

    public VacancyResponseDto toDto(Vacancy vacancy) {
        VacancyResponseDto dto = new VacancyResponseDto();
        dto.setId(vacancy.getId());
        dto.setTitle(vacancy.getTitle());
        dto.setSalaryFrom(vacancy.getSalaryFrom());
        dto.setSalaryTo(vacancy.getSalaryTo());
        dto.setCurrency(vacancy.getCurrency());
        dto.setDescription(vacancy.getDescription());
        dto.setEmployment(vacancy.getEmployment());
        dto.setExperience(vacancy.getExperience());
        dto.setWorkFormat(vacancy.getWorkFormat());
        dto.setLink(vacancy.getLink());
        dto.setCity(vacancy.getCity());
        dto.setCharge(vacancy.getCharge());
        dto.setRequirements(vacancy.getRequirements());
        dto.setConditions(vacancy.getConditions());
        dto.setEmployer(vacancy.getEmployer());
        dto.setStack(vacancy.getStack());

        dto.setSkills(
                vacancy.getSkills().stream()
                        .map(skill -> new KeySkillDto(skill.getId(), skill.getName()))
                        .collect(Collectors.toSet())
        );

        return dto;
    }

    public Vacancy fromDto(NewVacancyDto vacancyDto) {
        return createVacancy(vacancyDto);
    }

    private Vacancy createVacancy(final NewVacancyDto vacancyDto) {

        Set<KeySkill> keySkills = new HashSet<>(keySkillRepository.
                findAllById(new HashSet<>(vacancyDto.getSkills())));
        Experience experience = experienceRepository.findById(vacancyDto.getExperience()).orElse(null);
        Employment employment = employmentRepository.findById(vacancyDto.getEmployment()).orElse(null);
        Currency currency = currencyRepository.findById(vacancyDto.getSalary().getCurrency()).orElse(null);
        WorkFormat workFormat = workFormatRepository.findById(vacancyDto.getWorkFormat()).orElse(null);
        Stack stack = stackRepository.findById(vacancyDto.getStack()).orElse(null);

        return new Vacancy(vacancyDto.getTitle(), stack, vacancyDto.getSalary().getFrom(), vacancyDto.getSalary().getTo(),
                vacancyDto.getCity(), currency, vacancyDto.getDescription(), vacancyDto.getRequirements(),
                vacancyDto.getConditions(), vacancyDto.getLink(), vacancyDto.getCharge(), employment,
                experience, workFormat, keySkills, LocalDateTime.now());
    }
}
