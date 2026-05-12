package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.aggregation.AggregatedEmployerData;
import com.diplom.internhubbackend.dto.sj.SjCatalogueItem;
import com.diplom.internhubbackend.dto.sj.SjClientDetailsResponse;
import com.diplom.internhubbackend.dto.sj.SjVacancyItem;
import com.diplom.internhubbackend.dto.sj.SjVacancyListResponse;
import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyContact;
import com.diplom.internhubbackend.models.VacancyDirection;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SjAggregationService {
    private static final Map<Integer, String> SJ_CATALOGUE_DIRECTION_IDS = buildSjCatalogueDirectionIds();
    private static final Set<Integer> BROAD_SJ_CATALOGUE_KEYS = Set.of(42, 503, 53, 603, 40);
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

    private record SjCatalogueDirection(Integer catalogueKey, String catalogueTitle, String directionId) {}

    private static Map<Integer, String> buildSjCatalogueDirectionIds() {
        Map<Integer, String> catalogueDirections = new LinkedHashMap<>();

        addDirection(catalogueDirections, VacancyDirectionService.DEVELOPMENT,
                36, 40, 42, 47, 48, 604, 503, 603, 53, 41);
        addDirection(catalogueDirections, VacancyDirectionService.DESIGN,
                43, 59, 35, 64, 66, 68, 637);
        addDirection(catalogueDirections, VacancyDirectionService.MANAGEMENT,
                613, 605, 630);
        addDirection(catalogueDirections, VacancyDirectionService.QA, 56);
        addDirection(catalogueDirections, VacancyDirectionService.DEVOPS,
                628, 629, 37, 49, 50, 51);
        addDirection(catalogueDirections, VacancyDirectionService.ANALYTICS,
                38, 45, 239, 244, 254);
        addDirection(catalogueDirections, VacancyDirectionService.DATA_AI,
                651, 627, 650);
        addDirection(catalogueDirections, VacancyDirectionService.SECURITY, 546);

        return Collections.unmodifiableMap(catalogueDirections);
    }

    private static void addDirection(Map<Integer, String> target, String directionId, Integer... catalogueKeys) {
        for (Integer catalogueKey : catalogueKeys) {
            target.put(catalogueKey, directionId);
        }
    }

    private final WebClient superJobWebClient;
    private final VacancyRepository vacancyRepository;
    private final VacancySourceService vacancySourceService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final EmployerProfileService employerProfileService;
    private final VacancyDirectionService vacancyDirectionService;
    private final VacancyExcludedWordService vacancyExcludedWordService;

    @Value("${superjob.api.key:}")
    private String superJobApiKey;

    public SjAggregationService(
            @Qualifier("superJobWebClient") WebClient superJobWebClient,
            VacancyRepository vacancyRepository,
            VacancySourceService vacancySourceService,
            WorkFormatService workFormatService,
            ExperienceService experienceService,
            EmploymentService employmentService,
            CurrencyService currencyService,
            EmployerProfileService employerProfileService,
            VacancyDirectionService vacancyDirectionService,
            VacancyExcludedWordService vacancyExcludedWordService
    ) {
        this.superJobWebClient = superJobWebClient;
        this.vacancyRepository = vacancyRepository;
        this.vacancySourceService = vacancySourceService;
        this.workFormatService = workFormatService;
        this.experienceService = experienceService;
        this.employmentService = employmentService;
        this.currencyService = currencyService;
        this.employerProfileService = employerProfileService;
        this.vacancyDirectionService = vacancyDirectionService;
        this.vacancyExcludedWordService = vacancyExcludedWordService;
    }

    public void fetchAndSave() {
        if (superJobApiKey == null || superJobApiKey.isBlank()) {
            log.warn("SuperJob aggregation skipped: superjob.api.key is empty");
            return;
        }

        VacancySource vacancySource = vacancySourceService.getVacancySourceByCode("SJ");
        if (vacancySource == null || !vacancySource.isActive()) {
            log.info("SuperJob source is disabled or absent in dictionary");
            return;
        }

        List<SjCatalogueDirection> catalogueDirections = resolveCatalogueDirections();
        if (catalogueDirections.isEmpty()) {
            log.warn("SuperJob aggregation skipped: no IT-related catalogue positions found");
            return;
        }

        Map<String, VacancyDirection> directionsById = vacancyDirectionService.getDefaultDirectionsById();
        List<String> excludedWords = vacancyExcludedWordService.getActiveWords();
        final int perPage = 40;

        for (SjCatalogueDirection catalogueDirection : catalogueDirections) {
            VacancyDirection direction = directionsById.get(catalogueDirection.directionId());
            if (direction == null) {
                continue;
            }

            int page = 0;
            while (true) {
                SjVacancyListResponse response = fetchVacancies(catalogueDirection, page, perPage);
                if (response == null || response.objects() == null || response.objects().isEmpty()) {
                    break;
                }

                log.info(
                        "SuperJob catalogue '{}' ({}) page {}: {} vacancies",
                        catalogueDirection.catalogueTitle(),
                        direction.getName(),
                        page,
                        response.objects().size()
                );

                for (SjVacancyItem item : response.objects()) {
                    if (item == null || item.id() == null || hasExcludedWords(item, excludedWords)) {
                        continue;
                    }

                    VacancyDirection resolvedDirection = resolveVacancyDirection(
                            item,
                            catalogueDirection,
                            directionsById
                    );
                    if (resolvedDirection == null) {
                        continue;
                    }

                    try {
                        saveVacancy(item, vacancySource, resolvedDirection).join();
                    } catch (Exception ex) {
                        log.warn("Failed to save SuperJob vacancy {}", item != null ? item.id() : null, ex);
                    }
                }

                if (!Boolean.TRUE.equals(response.more())) {
                    break;
                }
                page++;
            }
        }
    }

    @Transactional
    public CompletableFuture<Void> saveVacancy(
            @NonNull SjVacancyItem sjVacancyItem,
            @NonNull VacancySource vacancySource,
            @NonNull VacancyDirection direction
    ) {
        String externalId = String.valueOf(sjVacancyItem.id());
        if ("null".equals(externalId)) {
            return CompletableFuture.completedFuture(null);
        }
        String publicId = vacancySource.getCode().toLowerCase(Locale.ROOT) + "_" + externalId;

        Vacancy vacancy = vacancyRepository
                .findBySourceCodeAndExternalId(externalId, vacancySource.getCode())
                .orElseGet(() -> Vacancy.builder()
                        .source(vacancySource)
                        .externalId(externalId)
                        .publicId(publicId)
                        .isAggregated(true)
                        .build());

        vacancy.setTitle(nonBlankOrDefault(sjVacancyItem.profession(), "Untitled vacancy"));
        vacancy.setCity(
                sjVacancyItem.town() != null
                        ? nonBlankOrDefault(sjVacancyItem.town().title(), "Unknown")
                        : "Unknown"
        );
        vacancy.setDescription(nonBlankOrDefault(buildDescription(sjVacancyItem), sjVacancyItem.profession()));
        vacancy.setDirection(direction);
        Integer ttlDays = vacancySource.getTtlDays() == null ? 30 : vacancySource.getTtlDays();
        vacancy.setExpiresAt(LocalDateTime.now().plusDays(ttlDays));

        vacancy.setWorkFormat(workFormatService.getWorkFormatById(mapWorkFormatId(sjVacancyItem)));
        String experienceId = mapExperienceId(sjVacancyItem);
        vacancy.setExperience(
                experienceId != null
                        ? experienceService.getExperienceById(experienceId)
                        : null
        );
        String employmentId = mapEmploymentId(sjVacancyItem);
        vacancy.setEmployment(
                employmentId != null
                        ? employmentService.getEmploymentById(employmentId)
                        : null
        );

        Long paymentFrom = normalizeMoney(sjVacancyItem.paymentFrom());
        Long paymentTo = normalizeMoney(sjVacancyItem.paymentTo());
        vacancy.setSalaryFrom(paymentFrom);
        vacancy.setSalaryTo(paymentTo);

        String currencyId = normalizeCurrency(sjVacancyItem.currency());
        vacancy.setCurrency(currencyId == null ? null : currencyService.getCurrencyById(currencyId));

        User employer = employerProfileService.resolveAggregatedEmployer(buildEmployerData(sjVacancyItem));
        vacancy.setEmployer(employer);

        vacancy.setCreatedAt(resolveCreatedAt(sjVacancyItem));
        vacancy.setUpdatedAt(LocalDateTime.now());

        List<VacancyContact> contacts = new ArrayList<>();
        String link = nonBlankOrDefault(sjVacancyItem.link(), null);
        if (link != null) {
            contacts.add(
                    VacancyContact.builder()
                            .vacancy(vacancy)
                            .method(ContactMethod.SJ)
                            .value(link)
                            .build()
            );
        }
        vacancy.setContacts(contacts);

        vacancyRepository.save(vacancy);
        return CompletableFuture.completedFuture(null);
    }

    private SjVacancyListResponse fetchVacancies(SjCatalogueDirection catalogueDirection, int page, int perPage) {
        try {
            return superJobWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/vacancies/")
                            .queryParam("catalogues", catalogueDirection.catalogueKey())
                            .queryParam("page", page)
                            .queryParam("count", perPage)
                            .build())
                    .header("X-Api-App-Id", superJobApiKey)
                    .retrieve()
                    .bodyToMono(SjVacancyListResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)).filter(this::isRetryableSuperJobError))
                    .block();
        } catch (Exception ex) {
            log.warn(
                    "Failed to fetch SuperJob vacancies for catalogue '{}' page {}",
                    catalogueDirection.catalogueTitle(),
                    page,
                    ex
            );
            return null;
        }
    }

    private List<SjCatalogueDirection> resolveCatalogueDirections() {
        return fetchCatalogues().stream()
                .filter(this::isTargetParentCatalogue)
                .flatMap(parent -> safeList(parent.positions()).stream())
                .map(this::toCatalogueDirection)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toMap(
                        SjCatalogueDirection::catalogueKey,
                        direction -> direction,
                        (left, right) -> left
                ))
                .values()
                .stream()
                .toList();
    }

    private List<SjCatalogueItem> fetchCatalogues() {
        try {
            return superJobWebClient.get()
                    .uri("/catalogues/")
                    .header("X-Api-App-Id", superJobApiKey)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SjCatalogueItem>>() {})
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)).filter(this::isRetryableSuperJobError))
                    .blockOptional()
                    .orElse(Collections.emptyList());
        } catch (Exception ex) {
            log.warn("Failed to fetch SuperJob catalogues", ex);
            return Collections.emptyList();
        }
    }

    private boolean isTargetParentCatalogue(SjCatalogueItem catalogue) {
        if (catalogue == null) {
            return false;
        }

        String title = normalizedText(catalogue.title(), catalogue.titleRus());
        return title.contains("it")
                || title.contains("интернет")
                || title.contains("телеком")
                || title.contains("дизайн")
                || title.contains("маркетинг");
    }

    private Optional<SjCatalogueDirection> toCatalogueDirection(SjCatalogueItem position) {
        if (position == null || position.key() == null) {
            return Optional.empty();
        }

        String directionId = SJ_CATALOGUE_DIRECTION_IDS.get(position.key());
        if (directionId == null) {
            return Optional.empty();
        }

        return Optional.of(new SjCatalogueDirection(
                position.key(),
                nonBlankOrDefault(position.title(), nonBlankOrDefault(position.titleRus(), String.valueOf(position.key()))),
                directionId
        ));
    }

    private VacancyDirection resolveVacancyDirection(
            SjVacancyItem item,
            SjCatalogueDirection fallbackCatalogueDirection,
            Map<String, VacancyDirection> directionsById
    ) {
        String directionId = resolveDirectionByCatalogueKeys(item, false)
                .or(() -> resolveDirectionByCatalogueKeys(item, true))
                .orElse(fallbackCatalogueDirection.directionId());

        return directionsById.get(directionId);
    }

    private Optional<String> resolveDirectionByCatalogueKeys(SjVacancyItem item, boolean useBroadKeys) {
        Map<String, Integer> directionCounts = new LinkedHashMap<>();

        for (Integer catalogueKey : collectVacancyCatalogueKeys(item)) {
            String directionId = SJ_CATALOGUE_DIRECTION_IDS.get(catalogueKey);
            if (directionId == null || BROAD_SJ_CATALOGUE_KEYS.contains(catalogueKey) != useBroadKeys) {
                continue;
            }

            directionCounts.merge(directionId, 1, Integer::sum);
        }

        return selectDirectionByCountAndPriority(directionCounts);
    }

    private List<Integer> collectVacancyCatalogueKeys(SjVacancyItem item) {
        if (item == null || item.catalogues() == null) {
            return Collections.emptyList();
        }

        return item.catalogues().stream()
                .flatMap(catalogue -> safeList(catalogue.positions()).stream())
                .map(SjCatalogueItem::key)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
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

    private boolean hasExcludedWords(SjVacancyItem item, List<String> excludedWords) {
        return containsAny(normalizedText(item.profession()), excludedWords);
    }

    private boolean containsAny(String text, List<String> fragments) {
        if (text == null || text.isBlank()) {
            return false;
        }

        return fragments.stream()
                .map(fragment -> fragment.toLowerCase(Locale.ROOT))
                .anyMatch(text::contains);
    }

    private List<SjCatalogueItem> safeList(List<SjCatalogueItem> values) {
        return values == null ? Collections.emptyList() : values;
    }

    private String normalizedText(String... values) {
        return java.util.Arrays.stream(values)
                .filter(Objects::nonNull)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.joining(" "));
    }

    private String mapWorkFormatId(SjVacancyItem item) {
        Integer rawId = item.placeOfWork() != null ? item.placeOfWork().id() : null;
        if (rawId == null) {
            return "unknown";
        }

        return switch (rawId) {
            case 1 -> "office";
            case 2 -> "remote";
            default -> "unknown";
        };
    }

    private String mapExperienceId(SjVacancyItem item) {
        Integer rawId = item.experience() != null ? item.experience().id() : null;
        if (rawId == null) {
            return null;
        }

        return switch (rawId) {
            case 1 -> "noExperience";
            case 2 -> "between1And3";
            case 3 -> "between3And6";
            case 4 -> "moreThan6";
            default -> null;
        };
    }

    private String mapEmploymentId(SjVacancyItem item) {
        Integer rawId = item.typeOfWork() != null ? item.typeOfWork().id() : null;
        if (rawId == null) {
            return null;
        }

        return switch (rawId) {
            case 6 -> "full";
            case 10, 12, 13 -> "part";
            default -> null;
        };
    }

    private String normalizeCurrency(String rawCurrency) {
        if (rawCurrency == null || rawCurrency.isBlank()) {
            return null;
        }

        if (rawCurrency.equals("rub")) {
            return "RUR";
        }
        else if (rawCurrency.equals("uzs")) {
            return "UZS";
        }
        else {
            return null;
        }
    }

    private Long normalizeMoney(Long value) {
        if (value == null || value <= 0) {
            return null;
        }
        return value;
    }

    private String buildDescription(SjVacancyItem item) {
        List<String> chunks = java.util.stream.Stream.of(item.work(), item.candidat(), item.compensation())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        if (chunks.isEmpty()) {
            return null;
        }

        return String.join("\n\n", chunks);
    }

    private LocalDateTime resolveCreatedAt(SjVacancyItem item) {
        Long timestamp = item.datePublished() != null ? item.datePublished() : item.datePubTo();
        if (timestamp == null || timestamp <= 0) {
            return LocalDateTime.now();
        }

        return LocalDateTime.ofInstant(Instant.ofEpochSecond(timestamp), ZoneId.systemDefault());
    }

    private String nonBlankOrDefault(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value.trim();
    }

    private AggregatedEmployerData buildEmployerData(SjVacancyItem item) {
        if (item == null) {
            return null;
        }

        SjClientDetailsResponse client = fetchClientDetails(item.idClient());
        String companyName = nonBlankOrDefault(
                client != null ? client.title() : null,
                nonBlankOrDefault(item.firmName(), null)
        );
        if (companyName == null) {
            return null;
        }

        String externalId = item.idClient() != null && item.idClient() > 0
                ? String.valueOf(item.idClient())
                : companyName.toLowerCase(Locale.ROOT);
        String city = item.town() != null ? nonBlankOrDefault(item.town().title(), null) : null;

        return new AggregatedEmployerData(
                "SJ",
                externalId,
                companyName,
                nonBlankOrDefault(client != null ? client.description() : null, item.firmActivity()),
                nonBlankOrDefault(client != null ? client.clientLogo() : null, item.clientLogo()),
                null,
                nonBlankOrDefault(client != null ? client.link() : null, item.link()),
                city,
                client != null && client.blocked() != null ? !client.blocked() : null,
                null
        );
    }

    private SjClientDetailsResponse fetchClientDetails(Long clientId) {
        if (clientId == null || clientId <= 0) {
            return null;
        }

        try {
            return superJobWebClient.get()
                    .uri("/clients/{id}/", clientId)
                    .header("X-Api-App-Id", superJobApiKey)
                    .retrieve()
                    .bodyToMono(SjClientDetailsResponse.class)
                    .timeout(Duration.ofSeconds(8))
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)).filter(this::isRetryableSuperJobError))
                    .block();
        } catch (Exception ex) {
            log.warn("Failed to fetch SuperJob client details {}", clientId, ex);
            return null;
        }
    }

    private boolean isRetryableSuperJobError(Throwable error) {
        if (error instanceof WebClientRequestException) {
            return true;
        }

        if (error instanceof WebClientResponseException responseException) {
            return responseException.getStatusCode().is5xxServerError()
                    || responseException.getStatusCode().value() == 429;
        }

        return false;
    }
}
