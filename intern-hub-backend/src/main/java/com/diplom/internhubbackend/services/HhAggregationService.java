package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.dto.hh.HhItemVacancy;
import com.diplom.internhubbackend.repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

@Service
@Slf4j
@RequiredArgsConstructor
public class HhAggregationService {

    private final VacancyRepository vacancyRepository;
    private final UserService userService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;


//    @Async()
    @Transactional
    public CompletableFuture<Void> saveVacancy(HhItemVacancy hhItemVacancy,
                                               VacancySource vacancySource,
                                               Stack stack)  {

        return userService.createAggregationEmployer(hhItemVacancy.employer())
                .thenAccept(employer -> {
                    String publicId = vacancySource.getCode().toLowerCase() + "_" + hhItemVacancy.id();

                    Vacancy vacancy = vacancyRepository
                            .findBySourceCodeAndExternalId(hhItemVacancy.id(), vacancySource.getCode())
                            .orElse(null);

                    LocalDateTime expiresAt = LocalDateTime.now().plusDays(vacancySource.getTtlDays());

                    if (vacancy == null) {
                        vacancy = Vacancy.builder()
                                .source(vacancySource)
                                .externalId(hhItemVacancy.id())
                                .publicId(publicId)
                                .isAggregated(true)
                                .build();
                    }

                    vacancy.setTitle(hhItemVacancy.name());
                    vacancy.setCity(hhItemVacancy.address() != null
                            ? hhItemVacancy.address().city() : "Неизвестно");
                    vacancy.setStack(stack);
                    vacancy.setExpiresAt(expiresAt);

                    List<VacancyContact> contact = Stream.of(
                            VacancyContact.builder()
                                    .method(ContactMethod.HH)
                                    .vacancy(vacancy)
                                    .value(hhItemVacancy.alternativeUrl())
                                    .build()
                    ).toList();

                    vacancy.setContacts(contact);

                    String workFormat = (hhItemVacancy.workFormat() != null && !hhItemVacancy.workFormat().isEmpty())
                            ? hhItemVacancy.workFormat().getFirst().id()
                            : "UNKNOWN";
                    String workFormatId = switch (workFormat) {
                        case "ON_SITE" -> "office";
                        case "REMOTE"  -> "remote";
                        case "HYBRID"  -> "hybrid";
                        default        -> "unknown";
                    };

                    log.info("Format: {}", workFormat);
                    vacancy.setWorkFormat(workFormatService.getWorkFormatById(workFormatId));

                    if (hhItemVacancy.salary() != null) {
                        vacancy.setSalaryFrom(hhItemVacancy.salary().from());
                        vacancy.setSalaryTo(hhItemVacancy.salary().to());
                        vacancy.setCurrency(
                                currencyService.getCurrencyById(hhItemVacancy.salary().currency()));
                    }

                    vacancy.setExperience(
                            experienceService.getExperienceById(hhItemVacancy.experience().id()));
                    vacancy.setEmployment(
                            employmentService.getEmploymentById(hhItemVacancy.employment().id()));

                    DateTimeFormatter formatter =
                            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ");
                    LocalDateTime createdAt = OffsetDateTime
                            .parse(hhItemVacancy.createdAt(), formatter)
                            .toLocalDateTime();

                    vacancy.setCreatedAt(createdAt);
                    vacancy.setUpdatedAt(LocalDateTime.now());
                    vacancy.setEmployer(employer);


                    vacancyRepository.save(vacancy);

                });
    }
}
