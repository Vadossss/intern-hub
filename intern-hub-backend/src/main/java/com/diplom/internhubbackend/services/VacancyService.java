package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.FilterParams;
import com.diplom.internhubbackend.dto.NewVacancyDto;
import com.diplom.internhubbackend.dto.VacancyContactDto;
import com.diplom.internhubbackend.dto.VacancyFilterOptionsDto;
import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.dto.hh.HhVacancyDetailsResponse;
import com.diplom.internhubbackend.enums.ContactMethod;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyService {

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
    @Qualifier("superJobWebClient")
    private final WebClient superJobWebClient;


    @Transactional()
//    @Cacheable(value = "vacancy", key = "#publicId")
    public Vacancy getVacancy(String publicId) {
        Vacancy vacancy = vacancyRepository.findByPublicId(publicId.toLowerCase()).orElseThrow(() ->
                new VacancyNotFoundException("Vacancy not found"));

        if (vacancy.getDescription() == null) {
            VacancySource vacancySource = vacancySourceService
                    .getVacancySourceByCode(vacancy.getSource().getCode());
            if (vacancySource != null) {

                HhVacancyDetailsResponse hhVacancy = webClient.get()
                        .uri("/vacancies/{id}", vacancy.getExternalId())
                        .retrieve()
                        .bodyToMono(HhVacancyDetailsResponse.class)
                        .block();
                if (hhVacancy == null) {
                    return vacancy;
                }
                vacancy.setDescription(hhVacancy.description());
                vacancy.setSkills(hhVacancyClassificationService.resolveTags(
                        vacancy.getTitle(),
                        hhVacancy.description(),
                        hhVacancy.keySkills() != null ? hhVacancy.keySkills() : Collections.emptyList(),
                        vacancy.getStack()
                ));

                vacancyRepository.save(vacancy);

                return vacancy;
            }
            return vacancy;
        }
        return vacancy;
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

    public Page<VacancyResponseDto> getVacanciesByParams(FilterParams params) {
        int page = normalizePage(params.getPage());
        int size = normalizeSize(params.getSize());

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Vacancy> query = cb.createQuery(Vacancy.class);
        Root<Vacancy> root = query.from(Vacancy.class);

        List<Predicate> predicates = buildPredicates(params, cb, query, root);
        query.where(cb.and(predicates.toArray(new Predicate[0])));

        applySorting(params, cb, query, root);

        TypedQuery<Vacancy> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult(page * size);
        typedQuery.setMaxResults(size);

        List<Vacancy> content = typedQuery.getResultList();
        List<VacancyResponseDto> vacancies = vacancyMapper.toDto(content);

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Vacancy> countRoot = countQuery.from(Vacancy.class);

        List<Predicate> countPredicates = buildPredicates(params, cb, countQuery, countRoot);

        countQuery.select(cb.count(countRoot));
        countQuery.where(cb.and(countPredicates.toArray(new Predicate[0])));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(vacancies, PageRequest.of(page, size), total);
    }

    private void applySorting(
            FilterParams params,
            CriteriaBuilder cb,
            CriteriaQuery<Vacancy> query,
            Root<Vacancy> root
    ) {
        String sortBy = normalizeSortBy(params.getSortBy());

        if ("asc".equalsIgnoreCase(params.getSortDirection())) {
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

        if (params.getStack() != null) {
            predicates.add(cb.equal(root.get("stack"), params.getStack()));
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

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String likePattern(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private List<VacancyStatus> activeCatalogStatuses() {
        return List.of(VacancyStatus.APPROVED, VacancyStatus.PENDING);
    }

    @Transactional
    public void archiveVacancy(User user, String publicId) {

        Vacancy vacancy = vacancyRepository.findActiveVacancyByPublicId(publicId).orElseThrow(() ->
                new VacancyNotFoundException("Vacancy not found"));

        if (!vacancy.getEmployer().getId().equals(user.getId())) {
            throw new AccessDeniedException("User is not the owner of the vacancy");
        }

        if (vacancy.getStatus().equals(VacancyStatus.REJECTED) ||
                vacancy.getStatus().equals(VacancyStatus.REVISION_REQUIRED)) {
            throw new VacancyNotFoundException("Vacancy can not be archived");
        }

        vacancy.setStatus(VacancyStatus.ARCHIVED);
    }

    public Vacancy getActiveVacancy(String publicId) {
        return vacancyRepository.findActiveVacancyByPublicId(publicId).orElse(null);
    }

    @Transactional
    public void deleteVacancy(User user, String publicId) {
        Vacancy vacancy = vacancyRepository.findByPublicId(publicId).orElseThrow(() ->
                new VacancyNotFoundException("Vacancy not found"));

        if (!vacancy.getEmployer().getId().equals(user.getId())) {
            throw new AccessDeniedException("User is not the owner of the vacancy");
        }

        vacancyRepository.delete(vacancy);
    }

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


        vacancyRepository.save(vacancy);
        return ResponseEntity.ok().body("Successfully created vacancy");
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

    public void fetchAndSave(Stack stack) {

        try {
            hhAggregationService.fetchAndSave(stack);
        } catch (Exception ex) {
            log.warn("SuperJob aggregation failed for stack {}", stack.getName(), ex);
        }


    }

}
