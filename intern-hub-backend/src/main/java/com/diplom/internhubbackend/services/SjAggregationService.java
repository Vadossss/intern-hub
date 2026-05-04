package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.sj.SjVacancyItem;
import com.diplom.internhubbackend.dto.sj.SjVacancyListResponse;
import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.enums.UserRole;
import com.diplom.internhubbackend.models.Role;
import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyContact;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.repositories.UserRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class SjAggregationService {
    private static final int SEARCH_IN_TITLE = 1;
    private static final int SEARCH_IN_FULL_TEXT = 10;

    private static final String SEARCH_ALL_WORDS = "and";
    private static final String SEARCH_ANY_WORD = "or";
    private static final String SEARCH_EXACT_PHRASE = "particular";
    private static final String SEARCH_EXCLUDE_WORDS = "nein";

    private static final Map<String, String> SJ_STACK_ALIASES = Map.ofEntries(
            Map.entry("android", "android"),
            Map.entry("backend", "backend"),
            Map.entry("c#", "csharp"),
            Map.entry("csharp", "csharp"),
            Map.entry(".net", "csharp"),
            Map.entry("dotnet", "csharp"),
            Map.entry("asp.net", "csharp"),
            Map.entry("aspnet", "csharp"),
            Map.entry("datascience", "datascience"),
            Map.entry("data science", "datascience"),
            Map.entry("design", "design"),
            Map.entry("devops", "devops"),
            Map.entry("frontend", "frontend"),
            Map.entry("front-end", "frontend"),
            Map.entry("front end", "frontend"),
            Map.entry("go", "go"),
            Map.entry("golang", "go"),
            Map.entry("ios", "ios"),
            Map.entry("java", "java"),
            Map.entry("javascript", "javascript"),
            Map.entry("product", "product"),
            Map.entry("product manager", "product"),
            Map.entry("python", "python"),
            Map.entry("qa", "qa"),
            Map.entry("quality assurance", "qa"),
            Map.entry("security", "security"),
            Map.entry("infosec", "security")
    );

    private static final Map<String, SjSearchPreset> SJ_SEARCH_PRESETS = buildSjSearchPresets();

    private record SjKeywordClause(int srws, String skwc, String keys) {}

    private record SjSearchPreset(String keyword, List<SjKeywordClause> keywords) {}

    private final WebClient superJobWebClient;
    private final VacancyRepository vacancyRepository;
    private final VacancySourceService vacancySourceService;
    private final WorkFormatService workFormatService;
    private final ExperienceService experienceService;
    private final EmploymentService employmentService;
    private final CurrencyService currencyService;
    private final UserRepository userRepository;
    private final UserRoleService userRoleService;

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
            UserRepository userRepository,
            UserRoleService userRoleService
    ) {
        this.superJobWebClient = superJobWebClient;
        this.vacancyRepository = vacancyRepository;
        this.vacancySourceService = vacancySourceService;
        this.workFormatService = workFormatService;
        this.experienceService = experienceService;
        this.employmentService = employmentService;
        this.currencyService = currencyService;
        this.userRepository = userRepository;
        this.userRoleService = userRoleService;
    }

    public void fetchAndSave(Stack stack) {
        if (superJobApiKey == null || superJobApiKey.isBlank()) {
            log.warn("SuperJob aggregation skipped: superjob.api.key is empty");
            return;
        }

        VacancySource vacancySource = vacancySourceService.getVacancySourceByCode("SJ");
        if (vacancySource == null || !vacancySource.isActive()) {
            log.info("SuperJob source is disabled or absent in dictionary");
            return;
        }

        int page = 0;
        final int perPage = 100;

        while (true) {
            SjVacancyListResponse response = fetchVacancies(stack, page, perPage);
            if (response == null || response.objects() == null || response.objects().isEmpty()) {
                break;
            }

            log.info("SuperJob stack '{}' page {}: {} vacancies", stack.getName(), page, response.objects().size());

            for (SjVacancyItem item : response.objects()) {
                if (item == null || item.id() == null) {
                    continue;
                }
                try {
                    saveVacancy(item, vacancySource, stack).join();
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

    @Transactional
    public CompletableFuture<Void> saveVacancy(
            @NonNull SjVacancyItem sjVacancyItem,
            @NonNull VacancySource vacancySource,
            @NonNull Stack fallbackStack
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
        vacancy.setStack(fallbackStack);
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

        User employer = resolveOrCreateEmployer(sjVacancyItem.firmName());
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

    private SjVacancyListResponse fetchVacancies(Stack stack, int page, int perPage) {
        SjSearchPreset searchPreset = resolveSearchPreset(stack);

        try {
            return superJobWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/vacancies/")
                            .queryParam("keyword", searchPreset.keyword())
                            .queryParam("keywords_count", searchPreset.keywords().size())
                            .queryParamIfPresent("keywords[0][srws]", getKeywordSrws(searchPreset, 0))
                            .queryParamIfPresent("keywords[0][skwc]", getKeywordSkwc(searchPreset, 0))
                            .queryParamIfPresent("keywords[0][keys]", getKeywordKeys(searchPreset, 0))
                            .queryParamIfPresent("keywords[1][srws]", getKeywordSrws(searchPreset, 1))
                            .queryParamIfPresent("keywords[1][skwc]", getKeywordSkwc(searchPreset, 1))
                            .queryParamIfPresent("keywords[1][keys]", getKeywordKeys(searchPreset, 1))
                            .queryParamIfPresent("keywords[2][srws]", getKeywordSrws(searchPreset, 2))
                            .queryParamIfPresent("keywords[2][skwc]", getKeywordSkwc(searchPreset, 2))
                            .queryParamIfPresent("keywords[2][keys]", getKeywordKeys(searchPreset, 2))
                            .queryParamIfPresent("keywords[3][srws]", getKeywordSrws(searchPreset, 3))
                            .queryParamIfPresent("keywords[3][skwc]", getKeywordSkwc(searchPreset, 3))
                            .queryParamIfPresent("keywords[3][keys]", getKeywordKeys(searchPreset, 3))
                            .queryParam("page", page)
                            .queryParam("count", perPage)
                            .build())
                    .header("X-Api-App-Id", superJobApiKey)
                    .retrieve()
                    .bodyToMono(SjVacancyListResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
                    .block();
        } catch (Exception ex) {
            log.warn("Failed to fetch SuperJob vacancies for stack '{}' page {}", stack.getName(), page, ex);
            return null;
        }
    }

    private static Map<String, SjSearchPreset> buildSjSearchPresets() {
        Map<String, SjSearchPreset> presets = new HashMap<>();

        presets.put("android", preset(
                "android developer",
                keywordClause(SEARCH_IN_TITLE, SEARCH_ANY_WORD, "android"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("backend", preset(
                "backend developer",
                keywordClause(SEARCH_IN_TITLE, SEARCH_ALL_WORDS, "backend developer"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("csharp", preset(
                "c# developer",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "c# csharp .net asp.net aspnet"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("datascience", preset(
                "data science",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "data data science analytics ml machine learning ai python r"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "analyst scientist engineer developer")
        ));
        presets.put("design", preset(
                "ui ux designer",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "design designer ui ux user interface web design graphic product"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "designer specialist artist")
        ));
        presets.put("devops", preset(
                "devops engineer",
                keywordClause(SEARCH_IN_TITLE, SEARCH_ALL_WORDS, "devops engineer"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "engineer")
        ));
        presets.put("frontend", preset(
                "frontend developer",
                keywordClause(SEARCH_IN_TITLE, SEARCH_ANY_WORD, "frontend front-end front end"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("go", preset(
                "golang developer",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "golang go"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("ios", preset(
                "ios developer",
                keywordClause(SEARCH_IN_TITLE, SEARCH_ANY_WORD, "ios"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("java", preset(
                "java developer",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "java java backend spring spring* hibernate"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("javascript", preset(
                "frontend javascript",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "frontend front-end front end react* vue* angular next.js nest.js"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_EXCLUDE_WORDS, "middle senior")
        ));
        presets.put("product", preset(
                "product manager it",
                keywordClause(SEARCH_IN_TITLE, SEARCH_EXACT_PHRASE, "product manager"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "it")
        ));
        presets.put("python", preset(
                "python developer",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "python django flask fastapi"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "developer engineer")
        ));
        presets.put("qa", preset(
                "qa engineer",
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "qa test* quality assurance"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "engineer specialist developer")
        ));
        presets.put("security", preset(
                "security engineer",
                keywordClause(SEARCH_IN_TITLE, SEARCH_ANY_WORD, "security"),
                keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, "engineer")
        ));

        return Map.copyOf(presets);
    }

    private SjSearchPreset resolveSearchPreset(Stack stack) {
        String stackKey = resolveStackKey(stack);
        if (stackKey != null) {
            SjSearchPreset preset = SJ_SEARCH_PRESETS.get(stackKey);
            if (preset != null) {
                return preset;
            }
        }

        String fallbackKeyword = nonBlankOrDefault(
                stack != null ? stack.getSearchQuery() : null,
                nonBlankOrDefault(stack != null ? stack.getName() : null, "developer")
        );
        return preset(fallbackKeyword, keywordClause(SEARCH_IN_FULL_TEXT, SEARCH_ANY_WORD, fallbackKeyword));
    }

    private String resolveStackKey(Stack stack) {
        if (stack == null) {
            return null;
        }

        String byId = canonicalStackKey(stack.getId());
        if (byId != null) {
            return byId;
        }

        return canonicalStackKey(stack.getName());
    }

    private String canonicalStackKey(String rawKey) {
        if (rawKey == null || rawKey.isBlank()) {
            return null;
        }

        String normalized = rawKey.trim().toLowerCase(Locale.ROOT);
        String exact = SJ_STACK_ALIASES.get(normalized);
        if (exact != null) {
            return exact;
        }

        String compact = normalized
                .replace("_", " ")
                .replace("-", " ")
                .replaceAll("\\s+", " ")
                .trim();
        String compactAlias = SJ_STACK_ALIASES.get(compact);
        if (compactAlias != null) {
            return compactAlias;
        }

        String withoutSpaces = compact.replace(" ", "");
        return SJ_STACK_ALIASES.get(withoutSpaces);
    }

    private static SjSearchPreset preset(String keyword, SjKeywordClause... keywords) {
        return new SjSearchPreset(keyword, List.of(keywords));
    }

    private static SjKeywordClause keywordClause(int srws, String skwc, String keys) {
        return new SjKeywordClause(srws, skwc, keys);
    }

    private Optional<Integer> getKeywordSrws(SjSearchPreset preset, int index) {
        if (index >= preset.keywords().size()) {
            return Optional.empty();
        }
        return Optional.of(preset.keywords().get(index).srws());
    }

    private Optional<String> getKeywordSkwc(SjSearchPreset preset, int index) {
        if (index >= preset.keywords().size()) {
            return Optional.empty();
        }
        return Optional.ofNullable(preset.keywords().get(index).skwc());
    }

    private Optional<String> getKeywordKeys(SjSearchPreset preset, int index) {
        if (index >= preset.keywords().size()) {
            return Optional.empty();
        }
        return Optional.ofNullable(preset.keywords().get(index).keys());
    }

    private User resolveOrCreateEmployer(String companyNameRaw) {
        String companyName = nonBlankOrDefault(companyNameRaw, null);
        if (companyName == null) {
            return null;
        }

        return userRepository.findUserByCompanyName(companyName).orElseGet(() -> {
            Role companyRole = userRoleService.findRoleById(UserRole.ROLE_EMPLOYER.name());
            if (companyRole == null) {
                return null;
            }

            User user = User.builder()
                    .companyName(companyName)
                    .isAggregated(true)
                    .verified(true)
                    .role(companyRole)
                    .build();

            return userRepository.save(user);
        });
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
            case 10, 13 -> "part";
            default -> null;
        };
    }

    private String normalizeCurrency(String rawCurrency) {
        if (rawCurrency == null || rawCurrency.isBlank()) {
            return null;
        }

        String normalized = rawCurrency.trim().toUpperCase(Locale.ROOT);
        if ("RUR".equals(normalized)) {
            return "RUB";
        }
        return normalized;
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
}
