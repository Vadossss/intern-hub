package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.hh.HhItemVacancy;
import com.diplom.internhubbackend.dto.hh.HhVacancyDetailsResponse;
import com.diplom.internhubbackend.dto.hh.HhVacancyListResponse;
import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.exception.TokenGenerationException;
import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyContact;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

@Service
@Slf4j
public class HhAggregationService {

    private final VacancyRepository vacancyRepository;
    private final UserService userService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final WebClient hhWebClient;
//    private final HhVacancyClassificationService hhVacancyClassificationService;
    private final VacancySourceService vacancySourceService;

    public HhAggregationService(
            VacancyRepository vacancyRepository,
            UserService userService,
            WorkFormatService workFormatService,
            ExperienceService experienceService,
            EmploymentService employmentService,
            CurrencyService currencyService,
            @Qualifier("hhWebClient")
            WebClient hhWebClient,
//            HhVacancyClassificationService hhVacancyClassificationService,
            VacancySourceService vacancySourceService) {
        this.vacancyRepository = vacancyRepository;
        this.userService = userService;
        this.workFormatService = workFormatService;
        this.experienceService = experienceService;
        this.employmentService = employmentService;
        this.currencyService = currencyService;
        this.hhWebClient = hhWebClient;
//        this.hhVacancyClassificationService = hhVacancyClassificationService;
        this.vacancySourceService = vacancySourceService;
    }

    public void fetchAndSave(Stack stack) {

        VacancySource vacancySource = vacancySourceService.getVacancySourceByCode("HH");

        if (vacancySource != null && vacancySource.isActive()) {

            int page = 0;

            while (true) {
                try {
                    int finalPage = page;
                    HhVacancyListResponse response = hhWebClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/vacancies")
                                    .queryParam("text", stack.getSearchQuery())
                                    .queryParam("vacancy_search_fields", "name")
                                    .queryParam("per_page", "100")
                                    .queryParam("page", finalPage)
                                    .build())
                            .retrieve()
                            .bodyToMono(HhVacancyListResponse.class)
                            .timeout(Duration.ofSeconds(10))
                            .retryWhen(Retry.fixedDelay(3, Duration.ofSeconds(2)))
                            .block();

                    if (response == null || response.items() == null || response.items().isEmpty()) {
                        break;
                    }

                    log.info("Сохранено {} вакансий", response.items().size());

                    for (HhItemVacancy item : response.items()) {
                        try {
                            saveVacancy(item, vacancySource, stack).join();
                        } catch (Exception e) {
                            log.error("Ошибка при получении вакансии", e);
                        }
                    }

                    page++;
                    if (page >= response.pages()) break;
                } catch (Exception e) {
                    throw new TokenGenerationException("Ошибка при получении токена: " + e);
                }
            }
        }


    }

    @Transactional
    public CompletableFuture<Void> saveVacancy(HhItemVacancy hhItemVacancy,
                                               VacancySource vacancySource,
                                               Stack fallbackStack) {

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
                            ? hhItemVacancy.address().city() : "Unknown");
                    vacancy.setExpiresAt(expiresAt);

//                    HhVacancyDetailsResponse details = fetchVacancyDetails(hhItemVacancy.id());
//                    String description = details != null ? details.description() : null;
//                    List<HhKeySkill> hhSkills = details != null && details.keySkills() != null
//                            ? details.keySkills()
//                            : Collections.emptyList();
//
//                    vacancy.setDescription(description);
//                    Stack resolvedStack = hhVacancyClassificationService
//                            .resolveStack(hhItemVacancy, fallbackStack, description, hhSkills);
//                    vacancy.setStack(resolvedStack);
//                    vacancy.setSkills(hhVacancyClassificationService
//                            .resolveTags(hhItemVacancy, description, hhSkills, resolvedStack));

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
                        case "REMOTE" -> "remote";
                        case "HYBRID" -> "hybrid";
                        default -> "unknown";
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

    private HhVacancyDetailsResponse fetchVacancyDetails(String vacancyId) {
        try {
            return hhWebClient.get()
                    .uri("/vacancies/{id}", vacancyId)
                    .retrieve()
                    .bodyToMono(HhVacancyDetailsResponse.class)
                    .timeout(Duration.ofSeconds(8))
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
                    .block();
        } catch (Exception e) {
            log.warn("Failed to fetch HH vacancy details {}", vacancyId, e);
            return null;
        }
    }
}
