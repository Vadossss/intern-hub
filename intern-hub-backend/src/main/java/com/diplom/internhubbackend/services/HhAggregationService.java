package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.aggregation.AggregatedEmployerData;
import com.diplom.internhubbackend.dto.hh.HhEmployerDetailsResponse;
import com.diplom.internhubbackend.dto.hh.HhItemVacancy;
import com.diplom.internhubbackend.dto.hh.HhNamedEntity;
import com.diplom.internhubbackend.dto.hh.HhProfessionalRole;
import com.diplom.internhubbackend.dto.hh.HhProfessionalRolesResponse;
import com.diplom.internhubbackend.dto.hh.HhVacancyDetailsResponse;
import com.diplom.internhubbackend.dto.hh.HhVacancyListResponse;
import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyContact;
import com.diplom.internhubbackend.models.VacancyDirection;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class HhAggregationService {
    private static final Map<String, String> HH_PROFESSIONAL_ROLE_DIRECTION_IDS =
            buildHhProfessionalRoleDirectionIds();
    private static final List<String> DIRECTION_PRIORITY = List.of(
            VacancyDirectionService.MANAGEMENT,
            VacancyDirectionService.SECURITY,
            VacancyDirectionService.DATA_AI,
            VacancyDirectionService.DEVOPS,
            VacancyDirectionService.QA,
            VacancyDirectionService.ANALYTICS,
            VacancyDirectionService.DESIGN,
            VacancyDirectionService.DEVELOPMENT
    );
    private static final DateTimeFormatter HH_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ");

    private record HhRoleDirection(String roleId, String roleName, String directionId) {}

    private static Map<String, String> buildHhProfessionalRoleDirectionIds() {
        Map<String, String> roleDirections = new LinkedHashMap<>();

        addDirection(roleDirections, VacancyDirectionService.DEVELOPMENT, "96");
        addDirection(roleDirections, VacancyDirectionService.DESIGN, "12", "25", "34");
        addDirection(roleDirections, VacancyDirectionService.MANAGEMENT, "36", "73", "104", "157", "170");
        addDirection(roleDirections, VacancyDirectionService.QA, "124");
        addDirection(roleDirections, VacancyDirectionService.DEVOPS, "160", "112", "113", "114");
        addDirection(roleDirections, VacancyDirectionService.ANALYTICS,
                "10", "150", "148", "156", "164", "155", "163", "68");
        addDirection(roleDirections, VacancyDirectionService.DATA_AI, "165");
        addDirection(roleDirections, VacancyDirectionService.SECURITY, "116");

        return Collections.unmodifiableMap(roleDirections);
    }

    private static void addDirection(Map<String, String> target, String directionId, String... roleIds) {
        for (String roleId : roleIds) {
            target.put(roleId, directionId);
        }
    }

    private final VacancyRepository vacancyRepository;
    private final UserService userService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final WebClient hhWebClient;
    private final VacancySourceService vacancySourceService;
    private final VacancyDirectionService vacancyDirectionService;
    private final VacancyExcludedWordService vacancyExcludedWordService;
    private final KeySkillService keySkillService;

    public HhAggregationService(
            VacancyRepository vacancyRepository,
            UserService userService,
            WorkFormatService workFormatService,
            ExperienceService experienceService,
            EmploymentService employmentService,
            CurrencyService currencyService,
            @Qualifier("hhWebClient") WebClient hhWebClient,
            VacancySourceService vacancySourceService,
            VacancyDirectionService vacancyDirectionService,
            VacancyExcludedWordService vacancyExcludedWordService,
            KeySkillService keySkillService
    ) {
        this.vacancyRepository = vacancyRepository;
        this.userService = userService;
        this.workFormatService = workFormatService;
        this.experienceService = experienceService;
        this.employmentService = employmentService;
        this.currencyService = currencyService;
        this.hhWebClient = hhWebClient;
        this.vacancySourceService = vacancySourceService;
        this.vacancyDirectionService = vacancyDirectionService;
        this.vacancyExcludedWordService = vacancyExcludedWordService;
        this.keySkillService = keySkillService;
    }

    public synchronized void fetchAndSave() {
        VacancySource vacancySource = vacancySourceService.getVacancySourceByCode("HH");
        if (vacancySource == null || !vacancySource.isActive()) {
            log.info("HeadHunter source is disabled or absent in dictionary");
            return;
        }

        List<HhRoleDirection> roleDirections = resolveProfessionalRoleDirections();
        if (roleDirections.isEmpty()) {
            log.warn("HeadHunter aggregation skipped: no IT-related professional roles found");
            return;
        }

        Map<String, VacancyDirection> directionsById = vacancyDirectionService.getDefaultDirectionsById();
        List<String> excludedWords = vacancyExcludedWordService.getActiveWords();
        Set<String> processedExternalIds = new HashSet<>();
        final int perPage = 100;

        for (HhRoleDirection roleDirection : roleDirections) {
            VacancyDirection direction = directionsById.get(roleDirection.directionId());
            if (direction == null) {
                continue;
            }

            int page = 0;
            while (true) {
                HhVacancyListResponse response = fetchVacancies(roleDirection, page, perPage);
                if (response == null || response.items() == null || response.items().isEmpty()) {
                    break;
                }

                log.info(
                        "HeadHunter professional role '{}' ({}) page {}: {} vacancies",
                        roleDirection.roleName(),
                        direction.getName(),
                        page,
                        response.items().size()
                );

                processVacancyPage(
                        response.items(),
                        vacancySource,
                        roleDirection,
                        directionsById,
                        excludedWords,
                        processedExternalIds
                );

                page++;
                if (response.pages() == null || page >= response.pages()) {
                    break;
                }
            }
        }
    }

    private void processVacancyPage(
            List<HhItemVacancy> items,
            VacancySource vacancySource,
            HhRoleDirection fallbackRoleDirection,
            Map<String, VacancyDirection> directionsById,
            List<String> excludedWords,
            Set<String> processedExternalIds
    ) {
        List<HhItemVacancy> validItems = items.stream()
                .filter(item -> item != null && item.id() != null && !hasExcludedWords(item, excludedWords))
                .collect(Collectors.toMap(
                        HhItemVacancy::id,
                        item -> item,
                        (left, right) -> left,
                        LinkedHashMap::new
                ))
                .values()
                .stream()
                .filter(item -> processedExternalIds.add(item.id()))
                .toList();

        if (validItems.isEmpty()) {
            return;
        }

        List<String> externalIds = validItems.stream()
                .map(HhItemVacancy::id)
                .toList();
        List<String> publicIds = externalIds.stream()
                .map(externalId -> buildPublicId(vacancySource, externalId))
                .toList();
        Map<String, Vacancy> existingByExternalId = vacancyRepository
                .findAllBySourceCodeAndExternalIdIn(vacancySource.getCode(), externalIds)
                .stream()
                .collect(Collectors.toMap(
                        Vacancy::getExternalId,
                        vacancy -> vacancy,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
        Map<String, Vacancy> existingByPublicId = vacancyRepository
                .findAllByPublicIdIn(publicIds)
                .stream()
                .collect(Collectors.toMap(
                        Vacancy::getPublicId,
                        vacancy -> vacancy,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        LocalDateTime updatedAt = LocalDateTime.now();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(resolveTtlDays(vacancySource));
        List<Integer> existingIds = Stream.concat(
                        existingByExternalId.values().stream(),
                        existingByPublicId.values().stream()
                )
                .map(Vacancy::getId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (!existingIds.isEmpty()) {
            vacancyRepository.updateExpiresAtByIds(existingIds, expiresAt, updatedAt);
        }

        List<Vacancy> vacanciesToCreate = new ArrayList<>();
        for (HhItemVacancy item : validItems) {
            if (existingByExternalId.containsKey(item.id())
                    || existingByPublicId.containsKey(buildPublicId(vacancySource, item.id()))) {
                continue;
            }

            try {
                Vacancy vacancy = buildNewVacancy(
                        item,
                        vacancySource,
                        fallbackRoleDirection,
                        directionsById,
                        expiresAt,
                        updatedAt
                );
                if (vacancy != null) {
                    vacanciesToCreate.add(vacancy);
                }
            } catch (Exception e) {
                log.warn("Failed to build HeadHunter vacancy {}", item.id(), e);
            }
        }

        if (!vacanciesToCreate.isEmpty()) {
            saveNewVacancies(vacanciesToCreate, expiresAt, updatedAt);
        }
    }

    private void saveNewVacancies(
            List<Vacancy> vacanciesToCreate,
            LocalDateTime expiresAt,
            LocalDateTime updatedAt
    ) {
        try {
            vacancyRepository.saveAll(vacanciesToCreate);
        } catch (DataIntegrityViolationException ex) {
            log.warn("HeadHunter vacancy batch contains already existing public ids, retrying individually");
            retrySaveNewVacancies(vacanciesToCreate, expiresAt, updatedAt);
        }
    }

    private void retrySaveNewVacancies(
            List<Vacancy> vacanciesToCreate,
            LocalDateTime expiresAt,
            LocalDateTime updatedAt
    ) {
        for (Vacancy vacancy : vacanciesToCreate) {
            Optional<Vacancy> existing = vacancyRepository.findByPublicId(vacancy.getPublicId().toLowerCase(Locale.ROOT));
            if (existing.isPresent() && existing.get().getId() != null) {
                vacancyRepository.updateExpiresAtByIds(List.of(existing.get().getId()), expiresAt, updatedAt);
                continue;
            }

            try {
                vacancyRepository.save(vacancy);
            } catch (DataIntegrityViolationException ignored) {
                log.warn("HeadHunter vacancy {} already exists, skipped duplicate insert", vacancy.getPublicId());
            }
        }
    }

    private Vacancy buildNewVacancy(
            HhItemVacancy hhItemVacancy,
            VacancySource vacancySource,
            HhRoleDirection fallbackRoleDirection,
            Map<String, VacancyDirection> directionsById,
            LocalDateTime expiresAt,
            LocalDateTime updatedAt
    ) {
        HhVacancyDetailsResponse details = fetchVacancyDetails(hhItemVacancy.id());
        AggregatedEmployerData employerData = buildEmployerData(hhItemVacancy);
        if (employerData == null) {
            return null;
        }

        User employer = userService.createAggregationEmployer(employerData).join();
        if (employer == null) {
            return null;
        }

        String directionId = resolveDirectionId(hhItemVacancy, details)
                .orElse(fallbackRoleDirection.directionId());
        VacancyDirection direction = directionsById.get(directionId);
        if (direction == null) {
            log.warn("HeadHunter vacancy {} skipped: direction '{}' not found", hhItemVacancy.id(), directionId);
            return null;
        }

        String publicId = buildPublicId(vacancySource, hhItemVacancy.id());
        Vacancy vacancy = Vacancy.builder()
                .source(vacancySource)
                .externalId(hhItemVacancy.id())
                .publicId(publicId)
                .isAggregated(true)
                .build();

        vacancy.setTitle(nonBlankOrDefault(hhItemVacancy.name(), "Untitled vacancy"));
        vacancy.setCity(resolveCity(hhItemVacancy));
        vacancy.setDescription(nonBlankOrDefault(
                details != null ? details.description() : null,
                hhItemVacancy.name()
        ));
        vacancy.setSkills(details == null
                ? Collections.emptySet()
                : keySkillService.parseAndSaveKeySkills(details.keySkills()));
        vacancy.setDirection(direction);
        vacancy.setExpiresAt(expiresAt);

        vacancy.setWorkFormat(workFormatService.getWorkFormatById(mapWorkFormatId(hhItemVacancy)));
        vacancy.setExperience(hhItemVacancy.experience() == null
                ? null
                : experienceService.getExperienceById(hhItemVacancy.experience().id()));
        vacancy.setEmployment(hhItemVacancy.employment() == null
                ? null
                : employmentService.getEmploymentById(hhItemVacancy.employment().id().toLowerCase()));

        if (hhItemVacancy.salary() != null) {
            vacancy.setSalaryFrom(hhItemVacancy.salary().from());
            vacancy.setSalaryTo(hhItemVacancy.salary().to());
            vacancy.setCurrency(currencyService.getCurrencyById(hhItemVacancy.salary().currency()));
        } else {
            vacancy.setSalaryFrom(null);
            vacancy.setSalaryTo(null);
            vacancy.setCurrency(null);
        }

        vacancy.setContacts(Stream.of(
                VacancyContact.builder()
                        .method(ContactMethod.HH)
                        .vacancy(vacancy)
                        .value(hhItemVacancy.alternativeUrl())
                        .build()
        ).toList());

        vacancy.setCreatedAt(parseHhDate(hhItemVacancy.createdAt()));
        vacancy.setUpdatedAt(updatedAt);
        vacancy.setEmployer(employer);

        return vacancy;
    }

    private String buildPublicId(VacancySource vacancySource, String externalId) {
        return vacancySource.getCode().toLowerCase(Locale.ROOT) + "_" + externalId;
    }

    private HhVacancyListResponse fetchVacancies(HhRoleDirection roleDirection, int page, int perPage) {
        try {
            return hhWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/vacancies")
                            .queryParam("professional_role", roleDirection.roleId())
                            .queryParam("per_page", perPage)
                            .queryParam("page", page)
                            .build())
                    .retrieve()
                    .bodyToMono(HhVacancyListResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.fixedDelay(3, Duration.ofSeconds(2)))
                    .block();
        } catch (Exception e) {
            log.warn(
                    "Failed to fetch HeadHunter vacancies for professional role '{}' page {}",
                    roleDirection.roleName(),
                    page,
                    e
            );
            return null;
        }
    }

    private List<HhRoleDirection> resolveProfessionalRoleDirections() {
        HhProfessionalRolesResponse response = fetchProfessionalRoles();
        if (response == null || response.categories() == null || response.categories().isEmpty()) {
            return fallbackRoleDirections();
        }

        List<HhRoleDirection> roleDirections = response.categories().stream()
                .filter(Objects::nonNull)
                .flatMap(category -> safeList(category.roles()).stream())
                .filter(role -> role != null && HH_PROFESSIONAL_ROLE_DIRECTION_IDS.containsKey(role.id()))
                .collect(Collectors.toMap(
                        HhProfessionalRole::id,
                        role -> new HhRoleDirection(
                                role.id(),
                                nonBlankOrDefault(role.name(), role.id()),
                                HH_PROFESSIONAL_ROLE_DIRECTION_IDS.get(role.id())
                        ),
                        (left, right) -> left,
                        LinkedHashMap::new
                ))
                .values()
                .stream()
                .toList();

        return roleDirections.isEmpty() ? fallbackRoleDirections() : roleDirections;
    }

    private HhProfessionalRolesResponse fetchProfessionalRoles() {
        try {
            return hhWebClient.get()
                    .uri("/professional_roles")
                    .retrieve()
                    .bodyToMono(HhProfessionalRolesResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
                    .block();
        } catch (Exception e) {
            log.warn("Failed to fetch HeadHunter professional roles", e);
            return null;
        }
    }

    private List<HhRoleDirection> fallbackRoleDirections() {
        return HH_PROFESSIONAL_ROLE_DIRECTION_IDS.entrySet().stream()
                .map(entry -> new HhRoleDirection(entry.getKey(), entry.getKey(), entry.getValue()))
                .toList();
    }

    private Optional<String> resolveDirectionId(HhItemVacancy item, HhVacancyDetailsResponse details) {
        Map<String, Integer> directionCounts = new LinkedHashMap<>();

        Stream.concat(
                        safeList(item.professionalRoles()).stream(),
                        details == null ? Stream.empty() : safeList(details.professionalRoles()).stream()
                )
                .map(HhNamedEntity::id)
                .filter(Objects::nonNull)
                .distinct()
                .map(HH_PROFESSIONAL_ROLE_DIRECTION_IDS::get)
                .filter(Objects::nonNull)
                .forEach(directionId -> directionCounts.merge(directionId, 1, Integer::sum));

        return selectDirectionByCountAndPriority(directionCounts);
    }

    private Optional<String> selectDirectionByCountAndPriority(Map<String, Integer> directionCounts) {
        String selectedDirection = null;
        int selectedCount = -1;
        int selectedPriority = Integer.MAX_VALUE;

        for (Map.Entry<String, Integer> entry : directionCounts.entrySet()) {
            int count = entry.getValue();
            int priority = directionPriority(entry.getKey());

            if (count > selectedCount || (count == selectedCount && priority < selectedPriority)) {
                selectedDirection = entry.getKey();
                selectedCount = count;
                selectedPriority = priority;
            }
        }

        return Optional.ofNullable(selectedDirection);
    }

    private int directionPriority(String directionId) {
        int priority = DIRECTION_PRIORITY.indexOf(directionId);
        return priority >= 0 ? priority : Integer.MAX_VALUE;
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

    private AggregatedEmployerData buildEmployerData(HhItemVacancy vacancy) {
        if (vacancy == null || vacancy.employer() == null) {
            return null;
        }

        HhEmployerDetailsResponse details = fetchEmployerDetails(vacancy.employer().id());
        String city = details != null && details.area() != null
                ? details.area().name()
                : resolveCity(vacancy);

        String avatarUrl = details != null && details.logoUrls() != null
                ? firstNonBlank(details.logoUrls().original(), firstNonBlank(details.logoUrls().big(), details.logoUrls().small()))
                : vacancy.employer().logoUrls() != null
                        ? firstNonBlank(vacancy.employer().logoUrls().original(), firstNonBlank(vacancy.employer().logoUrls().big(), vacancy.employer().logoUrls().small()))
                        : null;

        return new AggregatedEmployerData(
                "HH",
                firstNonBlank(details != null ? details.id() : null, vacancy.employer().id()),
                firstNonBlank(details != null ? details.name() : null, vacancy.employer().name()),
                details != null ? details.description() : null,
                avatarUrl,
                details != null ? details.siteUrl() : null,
                firstNonBlank(details != null ? details.alternateUrl() : null, vacancy.employer().alternateUrl()),
                city,
                firstNonNull(details != null ? details.trusted() : null, vacancy.employer().trusted()),
                firstNonNull(details != null ? details.accreditedItEmployer() : null, vacancy.employer().accreditedItEmployer())
        );
    }

    private HhEmployerDetailsResponse fetchEmployerDetails(String employerId) {
        if (employerId == null || employerId.isBlank()) {
            return null;
        }

        try {
            return hhWebClient.get()
                    .uri("/employers/{id}", employerId)
                    .retrieve()
                    .bodyToMono(HhEmployerDetailsResponse.class)
                    .timeout(Duration.ofSeconds(8))
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
                    .block();
        } catch (Exception e) {
            log.warn("Failed to fetch HH employer details {}", employerId, e);
            return null;
        }
    }

    private boolean hasExcludedWords(HhItemVacancy item, List<String> excludedWords) {
        return containsAny(normalizedText(item.name()), excludedWords);
    }

    private boolean containsAny(String text, List<String> fragments) {
        if (text == null || text.isBlank()) {
            return false;
        }

        return fragments.stream()
                .map(fragment -> fragment.toLowerCase(Locale.ROOT))
                .anyMatch(text::contains);
    }

    private String normalizedText(String... values) {
        return java.util.Arrays.stream(values)
                .filter(Objects::nonNull)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.joining(" "));
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? Collections.emptyList() : values;
    }

    private String resolveCity(HhItemVacancy vacancy) {
        if (vacancy.address() != null && vacancy.address().city() != null && !vacancy.address().city().isBlank()) {
            return vacancy.address().city();
        }

        if (vacancy.area() != null && vacancy.area().name() != null && !vacancy.area().name().isBlank()) {
            return vacancy.area().name();
        }

        return "Unknown";
    }

    private String mapWorkFormatId(HhItemVacancy item) {
        String workFormat = item.workFormat() != null && !item.workFormat().isEmpty()
                ? item.workFormat().getFirst().id()
                : "UNKNOWN";

        return switch (workFormat) {
            case "ON_SITE" -> "office";
            case "REMOTE" -> "remote";
            case "HYBRID" -> "hybrid";
            default -> "unknown";
        };
    }

    private long resolveTtlDays(VacancySource vacancySource) {
        return vacancySource.getTtlDays() == null ? 30 : vacancySource.getTtlDays();
    }

    private LocalDateTime parseHhDate(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now();
        }

        try {
            return OffsetDateTime.parse(value, HH_DATE_FORMATTER).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
            try {
                return OffsetDateTime.parse(value).toLocalDateTime();
            } catch (DateTimeParseException ex) {
                log.warn("Failed to parse HH date '{}'", value, ex);
                return LocalDateTime.now();
            }
        }
    }

    private String nonBlankOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }

    private String firstNonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Boolean firstNonNull(Boolean value, Boolean fallback) {
        return value != null ? value : fallback;
    }
}
