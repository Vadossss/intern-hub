package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.FilterParams;
import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.dto.NewVacancyDto;
import com.diplom.internhubbackend.dto.VacancyContactDto;
import com.diplom.internhubbackend.dto.VacancyFilterOptionsDto;
import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.dto.hh.HhVacancyDetailsResponse;
import com.diplom.internhubbackend.dto.projection.VacancyListProjection;
import com.diplom.internhubbackend.dto.projection.VacancyProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSkillProjection;
import com.diplom.internhubbackend.dto.projection.CandidateResumeSummaryProjection;
import com.diplom.internhubbackend.dto.projection.VacancySkillProjection;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyService {

    private static final int RECOMMENDATION_CANDIDATE_LIMIT = 600;
    private static final int RECOMMENDATION_PATTERN_LIMIT = 12;

    @PersistenceContext
    private EntityManager entityManager;

    private final WebClient webClient;
    private final VacancyRepository vacancyRepository;
    private final RestClient defaultRestClient = RestClient.create();
    private final HhAggregationService hhAggregationService;
    private final SjAggregationService sjAggregationService;
    private final HhVacancyClassificationService hhVacancyClassificationService;
    private final VacancySourceService vacancySourceService;
    private final VacancyMapper vacancyMapper;
    private final EmployerProfileRepository employerProfileRepository;
    private final CandidateResumeRepository candidateResumeRepository;
    private final VacancyDirectionService vacancyDirectionService;
    private final ViewTrackingService viewTrackingService;
    @Qualifier("superJobWebClient")
    private final WebClient superJobWebClient;


    @Transactional()
    @Cacheable(value = "vacancy_full", key = "#publicId")
    public Vacancy getVacancy(String publicId) {
        return vacancyRepository.findByPublicId(publicId.toLowerCase()).orElseThrow(() ->
                new VacancyNotFoundException("Vacancy not found"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "vacancy", key = "#publicId")
    public VacancyResponseDto getVacancyProjection(String publicId, User viewer, HttpServletRequest request) {
        String normalizedPublicId = publicId.toLowerCase();
        VacancyProjection vacancy = vacancyRepository.findByPublicIdProjection(normalizedPublicId).orElseThrow(() ->
                new VacancyNotFoundException("Vacancy not found"));
        validateVacancyAccess(vacancy, viewer);
        viewTrackingService.recordVacancyView(vacancy, viewer, request);

        Set<KeySkillDto> skills = vacancyRepository.findSkillDtosByPublicId(normalizedPublicId)
                .stream()
                .collect(Collectors.toSet());
        List<VacancyContactDto> contacts = vacancy.status() == VacancyStatus.ARCHIVED
                ? Collections.emptyList()
                : vacancyRepository.findContactDtosByPublicId(normalizedPublicId);

        VacancyResponseDto dto = vacancyMapper.toDto(vacancy, skills, contacts);
        dto.setViewCount(viewTrackingService.countVacancyViews(vacancy.id()));
        dto.setTodayViewCount(viewTrackingService.countVacancyViewsToday(vacancy.id()));

        return dto;
    }

    private void validateVacancyAccess(VacancyProjection vacancy, User viewer) {
        if (vacancy.employerStatus() != null && vacancy.employerStatus() != AccountStatus.ACTIVE) {
            if (viewer == null) {
                throw new AccessDeniedException("У вас нет доступа к этой вакансии");
            }

            String roleId = viewer.getRole() == null ? null : viewer.getRole().getId();
            if ("ROLE_ADMIN".equals(roleId)) {
                return;
            }

            if ("ROLE_EMPLOYER".equals(roleId) && Objects.equals(vacancy.employerId(), viewer.getId())) {
                return;
            }

            throw new AccessDeniedException("У вас нет доступа к этой вакансии");
        }

        if (vacancy.status() == VacancyStatus.APPROVED || vacancy.status() == VacancyStatus.ARCHIVED) {
            return;
        }

        if (viewer == null) {
            throw new AccessDeniedException("У вас нет доступа к этой вакансии");
        }

        String roleId = viewer.getRole() == null ? null : viewer.getRole().getId();
        if ("ROLE_ADMIN".equals(roleId)) {
            return;
        }

        if ("ROLE_EMPLOYER".equals(roleId) && Objects.equals(vacancy.employerId(), viewer.getId())) {
            return;
        }

        throw new AccessDeniedException("У вас нет доступа к этой вакансии");
    }

    public Page<VacancyResponseDto> getFavoritesVacancies(User user, int page, int pageSize) {
        List<Vacancy> vacancies = vacancyRepository.findAllFavoriteVacancies(user).orElse(null);

        if (vacancies == null) {
            return new PageImpl<>(new ArrayList<>());
        }

        List<VacancyResponseDto> vacanciesDto = vacancyMapper.toDto(vacancies);

        int startIndex = pageSize * page;

        if (vacanciesDto == null || vacanciesDto.size() <= startIndex) {
            return new PageImpl<>(new ArrayList<>());
        }


        List<VacancyResponseDto>result = vacanciesDto
                .subList(startIndex, Math.min(startIndex + pageSize, vacanciesDto.size()));
        viewTrackingService.applyVacancyViewCounts(result);

        return new PageImpl<>(result, PageRequest.of(page, pageSize), vacancies.size());
    }

    public VacancyFilterOptionsDto getActiveFilterOptions() {
        List<VacancyStatus> activeStatuses = activeCatalogStatuses();

        return new VacancyFilterOptionsDto(
                vacancyRepository.findActiveVacancyCities(activeStatuses),
                vacancyRepository.findActiveVacancyCompanies(activeStatuses),
                vacancyRepository.findActiveVacancySources(activeStatuses)
                        .stream()
                        .map(source -> new VacancyFilterOptionsDto.FilterOptionDto(
                                source.getCode(),
                                source.getName()
                        ))
                        .collect(Collectors.toList()),
                vacancyRepository.findActiveVacancyDirections(activeStatuses)
                        .stream()
                        .map(direction -> new VacancyFilterOptionsDto.FilterOptionDto(
                                direction.getId(),
                                direction.getName()
                        ))
                        .collect(Collectors.toList())
        );
    }

    @Cacheable(value = "directions")
    public List<VacancyFilterOptionsDto.FilterOptionDto> getVacancyDirections() {
        return vacancyDirectionService.getDefaultDirections().stream()
                .map(direction -> new VacancyFilterOptionsDto.FilterOptionDto(
                        direction.getId(),
                        direction.getName()
                ))
                .toList();
    }

    public Page<VacancyResponseDto> getVacanciesByParams(FilterParams params) {
        int page = normalizePage(params.getPage());
        int size = normalizeSize(params.getSize());

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<VacancyListProjection> query = cb.createQuery(VacancyListProjection.class);
        Root<Vacancy> root = query.from(Vacancy.class);

        List<Predicate> predicates = buildPredicates(params, cb, query, root);
        applyListProjection(query, cb, root);
        query.where(cb.and(predicates.toArray(new Predicate[0])));

        applySorting(params, cb, query, root);

        TypedQuery<VacancyListProjection> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult(page * size);
        typedQuery.setMaxResults(size);

        List<VacancyListProjection> content = typedQuery.getResultList();
        Map<Integer, EmployerProfile> employerProfiles = getEmployerProfiles(content);
        List<VacancyResponseDto> vacancies = vacancyMapper.toListDto(content, employerProfiles);
        viewTrackingService.applyVacancyViewCounts(vacancies);

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Vacancy> countRoot = countQuery.from(Vacancy.class);

        List<Predicate> countPredicates = buildPredicates(params, cb, countQuery, countRoot);

        countQuery.select(cb.count(countRoot));
        countQuery.where(cb.and(countPredicates.toArray(new Predicate[0])));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(vacancies, PageRequest.of(page, size), total);
    }

    @Transactional(readOnly = true)
    @Cacheable(
            value = "vacancy_recommendations_default",
            key = "#root.target.recommendationCacheKey(#user, #params)",
            condition = "#user != null && #root.target.isDefaultRecommendationFilters(#params)"
    )
    public Page<VacancyResponseDto> getRecommendedVacancies(User user, FilterParams params) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        int page = normalizePage(params.getPage());
        int size = normalizeSize(params.getSize());
        PageRequest pageRequest = PageRequest.of(page, size);
        List<RecommendedResume> resumes = getRecommendationResumes(user.getId());

        if (resumes.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageRequest, 0);
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<VacancyListProjection> query = cb.createQuery(VacancyListProjection.class);
        Root<Vacancy> root = query.from(Vacancy.class);

        List<Predicate> predicates = buildPredicates(params, cb, query, root);
        Predicate recommendationPredicate = buildRecommendationPredicate(resumes, cb, query, root);

        if (recommendationPredicate == null) {
            return new PageImpl<>(Collections.emptyList(), pageRequest, 0);
        }

        predicates.add(recommendationPredicate);
        applyListProjection(query, cb, root);
        query.where(cb.and(predicates.toArray(new Predicate[0])));
        applySorting(params, cb, query, root);

        TypedQuery<VacancyListProjection> typedQuery = entityManager.createQuery(query);
        typedQuery.setMaxResults(RECOMMENDATION_CANDIDATE_LIMIT);

        List<VacancyListProjection> rankedContent = rankRecommendedVacancies(typedQuery.getResultList(), resumes);
        List<VacancyListProjection> pageContent = slicePage(rankedContent, page, size);
        Map<Integer, EmployerProfile> employerProfiles = getEmployerProfiles(pageContent);
        List<VacancyResponseDto> vacancies = vacancyMapper.toListDto(pageContent, employerProfiles);
        viewTrackingService.applyVacancyViewCounts(vacancies);

        return new PageImpl<>(vacancies, pageRequest, rankedContent.size());
    }

    public String recommendationCacheKey(User user, FilterParams params) {
        int page = params == null ? 0 : normalizePage(params.getPage());
        int size = params == null ? 20 : normalizeSize(params.getSize());
        String sortBy = params == null ? "createdAt" : normalizeSortBy(params.getSortBy());
        String sortDirection = params == null ? "desc" : normalizeSortDirection(params.getSortDirection());

        return user.getId() + ":" + page + ":" + size + ":" + sortBy + ":" + sortDirection;
    }

    public boolean isDefaultRecommendationFilters(FilterParams params) {
        if (params == null) {
            return true;
        }

        return isEmpty(params.getSource())
                && isEmpty(params.getDirection())
                && !hasText(params.getCity())
                && !hasText(params.getCompanyName())
                && !hasText(params.getEmployerId())
                && !hasText(params.getSchedule())
                && isEmpty(params.getEmployment())
                && isEmpty(params.getExperience())
                && params.getSalaryMin() == null
                && params.getSalaryMax() == null
                && params.getStatus() == null
                && !hasText(params.getSearchText())
                && isEmpty(params.getWorkFormats());
    }

    private Predicate buildRecommendationPredicate(
            List<RecommendedResume> resumes,
            CriteriaBuilder cb,
            CriteriaQuery<?> query,
            Root<Vacancy> root
    ) {
        List<Predicate> signals = new ArrayList<>();

        addIfPresent(signals, skillMatchPredicate(collectRecommendationSkillIds(resumes), cb, query, root));
        addIfPresent(signals, professionMatchPredicate(collectRecommendationPatterns(resumes), cb, root));

        if (signals.isEmpty()) {
            return null;
        }

        return cb.or(signals.toArray(new Predicate[0]));
    }

    private List<RecommendedResume> getRecommendationResumes(Integer userId) {
        List<CandidateResumeSummaryProjection> summaries = candidateResumeRepository.findActiveSummariesByUserId(userId);

        if (summaries.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> resumeIds = summaries.stream()
                .map(CandidateResumeSummaryProjection::id)
                .toList();
        Map<Long, Set<Integer>> skillsByResumeId = candidateResumeRepository.findSkillDtosByResumeIds(resumeIds)
                .stream()
                .collect(Collectors.groupingBy(
                        CandidateResumeSkillProjection::resumeId,
                        Collectors.mapping(CandidateResumeSkillProjection::skillId, Collectors.toSet())
                ));

        return summaries.stream()
                .map(resume -> new RecommendedResume(
                        resume.profession(),
                        resume.city(),
                        resume.expectedSalaryFrom(),
                        resume.expectedSalaryTo(),
                        resume.employmentId(),
                        resume.workFormatId(),
                        resume.experienceId(),
                        skillsByResumeId.getOrDefault(resume.id(), Collections.emptySet())
                ))
                .toList();
    }

    private void addIfPresent(List<Predicate> predicates, Predicate predicate) {
        if (predicate != null) {
            predicates.add(predicate);
        }
    }

    private Predicate skillMatchPredicate(
            Set<Integer> skillIds,
            CriteriaBuilder cb,
            CriteriaQuery<?> query,
            Root<Vacancy> root
    ) {
        if (skillIds.isEmpty()) {
            return null;
        }

        Subquery<Integer> skillSubquery = query.subquery(Integer.class);
        Root<Vacancy> vacancyRoot = skillSubquery.from(Vacancy.class);
        Join<Vacancy, KeySkill> skill = vacancyRoot.join("skills");

        skillSubquery
                .select(vacancyRoot.get("id"))
                .where(
                        cb.equal(vacancyRoot.get("id"), root.get("id")),
                        skill.get("id").in(skillIds)
                );

        return cb.exists(skillSubquery);
    }

    private Predicate professionMatchPredicate(
            List<String> patterns,
            CriteriaBuilder cb,
            Root<Vacancy> root
    ) {
        if (patterns.isEmpty()) {
            return null;
        }

        List<Predicate> textPredicates = new ArrayList<>();
        Join<Vacancy, VacancyDirection> direction = root.join("direction", JoinType.LEFT);

        for (String pattern : patterns) {
            textPredicates.add(cb.like(cb.lower(root.get("title")), pattern));
            textPredicates.add(cb.like(cb.lower(direction.get("name")), pattern));
        }

        return cb.or(textPredicates.toArray(new Predicate[0]));
    }

    private Set<Integer> collectRecommendationSkillIds(List<RecommendedResume> resumes) {
        return resumes.stream()
                .filter(resume -> resume.skillIds() != null)
                .flatMap(resume -> resume.skillIds().stream())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private List<String> collectRecommendationPatterns(List<RecommendedResume> resumes) {
        return resumes.stream()
                .flatMap(resume -> recommendationPatterns(resume.profession()).stream())
                .distinct()
                .limit(RECOMMENDATION_PATTERN_LIMIT)
                .toList();
    }

    private List<VacancyListProjection> rankRecommendedVacancies(
            List<VacancyListProjection> vacancies,
            List<RecommendedResume> resumes
    ) {
        if (vacancies.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Integer, Set<Integer>> skillIdsByVacancyId = getVacancySkillIds(vacancies);

        return vacancies.stream()
                .map(vacancy -> new ScoredVacancy(
                        vacancy,
                        calculateRecommendationScore(
                                vacancy,
                                skillIdsByVacancyId.getOrDefault(vacancy.id(), Collections.emptySet()),
                                resumes
                        )
                ))
                .filter(scoredVacancy -> scoredVacancy.score() > 0)
                .sorted((left, right) -> Integer.compare(right.score(), left.score()))
                .map(ScoredVacancy::vacancy)
                .toList();
    }

    private Map<Integer, Set<Integer>> getVacancySkillIds(List<VacancyListProjection> vacancies) {
        List<Integer> vacancyIds = vacancies.stream()
                .map(VacancyListProjection::id)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (vacancyIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return vacancyRepository.findSkillDtosByVacancyIds(vacancyIds)
                .stream()
                .collect(Collectors.groupingBy(
                        VacancySkillProjection::vacancyId,
                        Collectors.mapping(VacancySkillProjection::skillId, Collectors.toSet())
                ));
    }

    private int calculateRecommendationScore(
            VacancyListProjection vacancy,
            Set<Integer> vacancySkillIds,
            List<RecommendedResume> resumes
    ) {
        int bestScore = 0;

        for (RecommendedResume resume : resumes) {
            int score = 0;

            if (hasSharedSkill(vacancySkillIds, resume.skillIds())) {
                score += 50;
            }

            if (matchesProfession(vacancy, resume)) {
                score += 35;
            }

            if (matchesText(vacancy.city(), resume.city())) {
                score += 15;
            }

            if (matchesDictionary(vacancy.employment() == null ? null : vacancy.employment().getId(), resume.employmentId())) {
                score += 10;
            }

            if (matchesDictionary(vacancy.workFormat() == null ? null : vacancy.workFormat().getId(), resume.workFormatId())) {
                score += 10;
            }

            if (matchesDictionary(vacancy.experience() == null ? null : vacancy.experience().getId(), resume.experienceId())) {
                score += 8;
            }

            if (matchesSalary(vacancy, resume)) {
                score += 6;
            }

            bestScore = Math.max(bestScore, score);
        }

        return bestScore;
    }

    private boolean hasSharedSkill(Set<Integer> vacancySkillIds, Set<Integer> resumeSkillIds) {
        if (vacancySkillIds == null || vacancySkillIds.isEmpty()
                || resumeSkillIds == null || resumeSkillIds.isEmpty()) {
            return false;
        }

        for (Integer skillId : resumeSkillIds) {
            if (vacancySkillIds.contains(skillId)) {
                return true;
            }
        }

        return false;
    }

    private boolean matchesProfession(VacancyListProjection vacancy, RecommendedResume resume) {
        Set<String> terms = recommendationTerms(resume.profession());

        if (terms.isEmpty()) {
            return false;
        }

        return containsAnyTerm(vacancy.title(), terms) || containsAnyTerm(vacancy.direction(), terms);
    }

    private boolean containsAnyTerm(String value, Set<String> terms) {
        if (!hasText(value)) {
            return false;
        }

        String normalizedValue = value.toLowerCase();

        for (String term : terms) {
            if (normalizedValue.contains(term)) {
                return true;
            }
        }

        return false;
    }

    private boolean matchesText(String vacancyValue, String resumeValue) {
        return hasText(vacancyValue)
                && hasText(resumeValue)
                && vacancyValue.toLowerCase().contains(resumeValue.trim().toLowerCase());
    }

    private boolean matchesDictionary(String vacancyDictionaryId, String resumeDictionaryId) {
        return hasText(vacancyDictionaryId)
                && hasText(resumeDictionaryId)
                && vacancyDictionaryId.equals(resumeDictionaryId);
    }

    private boolean matchesSalary(VacancyListProjection vacancy, RecommendedResume resume) {
        Long expectedFrom = resume.expectedSalaryFrom();
        Long expectedTo = resume.expectedSalaryTo();

        if (expectedFrom == null && expectedTo == null) {
            return false;
        }

        Long salaryFrom = vacancy.salaryFrom();
        Long salaryTo = vacancy.salaryTo();

        if (salaryFrom == null && salaryTo == null) {
            return false;
        }

        boolean lowerBoundMatches = expectedFrom == null
                || (salaryTo != null && salaryTo >= expectedFrom)
                || (salaryTo == null && salaryFrom != null && salaryFrom >= expectedFrom);
        boolean upperBoundMatches = expectedTo == null
                || (salaryFrom != null && salaryFrom <= expectedTo)
                || (salaryFrom == null && salaryTo != null && salaryTo <= expectedTo);

        return lowerBoundMatches && upperBoundMatches;
    }

    private List<VacancyListProjection> slicePage(List<VacancyListProjection> vacancies, int page, int size) {
        int fromIndex = page * size;

        if (fromIndex >= vacancies.size()) {
            return Collections.emptyList();
        }

        return vacancies.subList(fromIndex, Math.min(fromIndex + size, vacancies.size()));
    }

    private Set<String> recommendationPatterns(String value) {
        return recommendationTerms(value).stream()
                .map(this::likePattern)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> recommendationTerms(String value) {
        if (!hasText(value)) {
            return Collections.emptySet();
        }

        Set<String> terms = new LinkedHashSet<>();
        String normalized = value.trim().toLowerCase();
        terms.add(normalized);

        for (String token : normalized.split("[\\s,.;:()/_-]+")) {
            if (token.length() >= 3) {
                terms.add(token);
            }
        }

        return terms;
    }

    private void applyListProjection(
            CriteriaQuery<VacancyListProjection> query,
            CriteriaBuilder cb,
            Root<Vacancy> root
    ) {
        Join<Vacancy, Currency> currency = root.join("currency", JoinType.LEFT);
        Join<Vacancy, Employment> employment = root.join("employment", JoinType.LEFT);
        Join<Vacancy, Experience> experience = root.join("experience", JoinType.LEFT);
        Join<Vacancy, WorkFormat> workFormat = root.join("workFormat", JoinType.LEFT);
        Join<Vacancy, VacancyDirection> direction = root.join("direction", JoinType.LEFT);
        Join<Vacancy, User> employer = root.join("employer", JoinType.LEFT);

        query.select(cb.construct(
                VacancyListProjection.class,
                root.get("id"),
                root.get("publicId"),
                root.get("title"),
                root.get("city"),
                root.get("status"),
                root.get("salaryFrom"),
                root.get("salaryTo"),
                currency,
                employment,
                experience,
                workFormat,
                direction.get("id"),
                direction.get("name"),
                employer.get("id"),
                employer.get("avatarUrl"),
                employer.get("verified"),
                employer.get("verificationStatus"),
                employer.get("verifiedAt"),
                employer.get("createdAt"),
                employer.get("updatedAt")
        ));
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

    private void applySorting(
            FilterParams params,
            CriteriaBuilder cb,
            CriteriaQuery<?> query,
            Root<Vacancy> root
    ) {
        String sortBy = normalizeSortBy(params.getSortBy());

        if ("asc".equals(normalizeSortDirection(params.getSortDirection()))) {
            query.orderBy(cb.asc(root.get(sortBy)));
        } else {
            query.orderBy(cb.desc(root.get(sortBy)));
        }
    }

    private List<Predicate> buildPredicates(
            FilterParams params,
            CriteriaBuilder cb,
            CriteriaQuery<?> query,
            Root<Vacancy> root
    ) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("employer").get("status"), AccountStatus.ACTIVE));

        if (params.getSource() != null && !params.getSource().isEmpty()) {
            predicates.add(root.get("source").in(params.getSource()));
        }

        if (hasText(params.getCity())) {
            predicates.add(cb.like(cb.lower(root.get("city")), likePattern(params.getCity())));
        }

        if (params.getStatus() != null) {
            predicates.add(cb.equal(root.get("status"), params.getStatus()));
        } else {
            predicates.add(root.get("status").in(activeCatalogStatuses()));
        }

        if (params.getWorkFormats() != null && !params.getWorkFormats().isEmpty()) {
            predicates.add(root.get("workFormat").in(params.getWorkFormats()));
        }

        if (params.getEmployment() != null && !params.getEmployment().isEmpty()) {
            predicates.add(root.get("employment").in(params.getEmployment()));
        }

        if (params.getExperience() != null && !params.getExperience().isEmpty()) {
            predicates.add(root.get("experience").in(params.getExperience()));
        }

        if (hasText(params.getEmployerId())) {
            predicates.add(cb.equal(root.get("employer").get("id"), params.getEmployerId()));
        }

        if (hasText(params.getCompanyName())) {
            predicates.add(companyNamePredicate(params.getCompanyName(), cb, query, root));
        }

        if (params.getDirection() != null && !params.getDirection().isEmpty()) {
            predicates.add(root.get("direction").get("id").in(params.getDirection()));
        }

        if (params.getSalaryMin() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("salaryFrom"), params.getSalaryMin()));
        }

        if (params.getSalaryMax() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("salaryTo"), params.getSalaryMax()));
        }

        if (hasText(params.getSearchText())) {
            String pattern = likePattern(params.getSearchText());
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern),
                    companyNamePredicate(params.getSearchText(), cb, query, root)
            ));
        }

        return predicates;
    }

    private Predicate companyNamePredicate(
            String companyName,
            CriteriaBuilder cb,
            CriteriaQuery<?> query,
            Root<Vacancy> root
    ) {
        String pattern = likePattern(companyName);
        Subquery<Integer> employerProfileUsers = query.subquery(Integer.class);
        Root<EmployerProfile> employerProfileRoot = employerProfileUsers.from(EmployerProfile.class);

        employerProfileUsers
                .select(employerProfileRoot.get("user").get("id"))
                .where(cb.like(cb.lower(employerProfileRoot.get("companyName")), pattern));

        return root.get("employer").get("id").in(employerProfileUsers);
    }

    private int normalizePage(Integer page) {
        return page == null || page < 0 ? 0 : page;
    }

    private int normalizeSize(Integer size) {
        return size == null || size < 1 ? 20 : Math.min(size, 100);
    }

    private String normalizeSortBy(String sortBy) {
        if ("salaryFrom".equals(sortBy)
                || "city".equals(sortBy)
                || "createdAt".equals(sortBy)) {
            return sortBy;
        }

        return "title";
    }

    private String normalizeSortDirection(String sortDirection) {
        return "asc".equalsIgnoreCase(sortDirection) ? "asc" : "desc";
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean isEmpty(List<?> values) {
        return values == null || values.isEmpty();
    }

    private String likePattern(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private List<VacancyStatus> activeCatalogStatuses() {
        return List.of(VacancyStatus.APPROVED);
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public void archiveVacancy(User user, String publicId) {
        int updated = vacancyRepository.archiveByPublicIdAndEmployerId(
                publicId.toLowerCase(),
                user.getId(),
                LocalDateTime.now()
        );

        if (updated == 0) {
            throw new VacancyNotFoundException("Vacancy not found");
        }
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public void restoreVacancy(User user, String publicId) {
        int updated = vacancyRepository.restoreByPublicIdAndEmployerId(
                publicId.toLowerCase(),
                user.getId(),
                LocalDateTime.now()
        );

        if (updated == 0) {
            throw new VacancyNotFoundException("Vacancy not found");
        }
    }

    public Vacancy getActiveVacancy(String publicId) {
        return vacancyRepository.findApprovedVacancyByPublicId(publicId).orElse(null);
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public void deleteVacancy(User user, String publicId) {
        Vacancy vacancy = vacancyRepository.findByPublicId(publicId).orElseThrow(() ->
                new VacancyNotFoundException("Vacancy not found"));

        if (!vacancy.getEmployer().getId().equals(user.getId())) {
            throw new AccessDeniedException("User is not the owner of the vacancy");
        }

        vacancyRepository.delete(vacancy);
    }

    @Transactional
    @CacheEvict(value = "vacancy_recommendations_default", allEntries = true)
    public ResponseEntity<Object> createVacancy(User user, NewVacancyDto newVacancy){
        validateSingleInternalContact(newVacancy);

        Vacancy vacancy = vacancyMapper.fromDto(newVacancy);
        vacancy.setEmployer(user);

        Vacancy finalVacancy = vacancy;
        List<VacancyContactDto> contactRequests =
                newVacancy.getContactsList() == null ? Collections.emptyList() : newVacancy.getContactsList();
        vacancy.setContacts(contactRequests.stream().map(contact ->
                VacancyContact
                        .builder()
                        .vacancy(finalVacancy)
                        .method(contact.chosenContactMethod())
                        .value(contact.contactValue())
                        .hint(contact.hint())
                        .build()
                ).collect(Collectors.toList()));

        vacancy = vacancyRepository.save(vacancy);
        vacancy.setPublicId(vacancy.getSource().getCode().toLowerCase() + "_" + vacancy.getId());

        return ResponseEntity.ok().body(getEmployerVacancyListDto(user.getId(), vacancy.getPublicId()));
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

    private void validateSingleInternalContact(NewVacancyDto newVacancy) {
        if (newVacancy.getContactsList() == null) {
            return;
        }

        long internalContacts = newVacancy.getContactsList().stream()
                .filter(contact -> contact.chosenContactMethod() == ContactMethod.INTERNAL_CHAT)
                .count();

        if (internalContacts > 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only one internal apply contact is allowed"
            );
        }
    }

    public void fetchAndSaveSJ() {
        try {
            sjAggregationService.fetchAndSave();
        } catch (Exception ex) {
            log.warn("SuperJob aggregation failed", ex);
        }
    }

    public void fetchAndSaveHH() {
        try {
            hhAggregationService.fetchAndSave();
        } catch (Exception ex) {
            log.warn("HeadHunter aggregation failed", ex);
        }
    }

    private record RecommendedResume(
            String profession,
            String city,
            Long expectedSalaryFrom,
            Long expectedSalaryTo,
            String employmentId,
            String workFormatId,
            String experienceId,
            Set<Integer> skillIds
    ) {
    }

    private record ScoredVacancy(
            VacancyListProjection vacancy,
            int score
    ) {
    }

}
