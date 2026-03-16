package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.NewVacancyDto;
import com.diplom.internhubbackend.exception.TokenGenerationException;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.mapper.ApplicationMapper;
import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.models.VacancySource;
import com.diplom.internhubbackend.dto.FilterParams;
import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.dto.hh.HhItemVacancy;
import com.diplom.internhubbackend.dto.hh.HhVacancyListResponse;
import com.diplom.internhubbackend.dto.hh.HhKeySkill;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import com.diplom.internhubbackend.repositories.ApplicationRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
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
    private final KeySkillService keySkillService;
    private final HhAggregationService hhAggregationService;
    private final VacancySourceService vacancySourceService;
    private final VacancyMapper vacancyMapper;
    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;


    @Transactional(readOnly = true)
    @Cacheable(value = "vacancy", key = "#publicId")
    public Vacancy getVacancy(String publicId) {
        Vacancy vacancy = vacancyRepository.findByPublicId(publicId.toLowerCase()).orElseThrow(() ->
                new VacancyNotFoundException("Vacancy not found"));

        if (vacancy.getDescription() == null) {
            VacancySource vacancySource = vacancySourceService
                    .getVacancySourceByCode(vacancy.getSource().getCode());
            if (vacancySource != null) {

                HhVacancy hhVacancy = webClient.get()
                        .uri("/vacancies/{id}", vacancy.getExternalId())
                        .retrieve()
                        .bodyToMono(HhVacancy.class)
                        .block();
                if (hhVacancy == null) {
                    return vacancy;
                }
                vacancy.setDescription(hhVacancy.description());

                vacancy.setSkills(keySkillService.parseAndSaveKeySkills(hhVacancy.keySkills));

                vacancyRepository.save(vacancy);

                return vacancy;
            }
            return vacancy;
        }
        return vacancy;
    }

    public Page<VacancyResponseDto> getVacanciesByParams(FilterParams params) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Vacancy> query = cb.createQuery(Vacancy.class);
        Root<Vacancy> root = query.from(Vacancy.class);

        List<Predicate> predicates = new ArrayList<>();

        if (params.getSource() != null && !params.getSource().isEmpty()) {
            predicates.add(root.get("source").in(params.getSource()));
        }

        if (params.getCity() != null) {
            predicates.add(cb.equal(root.get("city"), params.getCity()));
        }

        if (params.getStatus() != null) {
            predicates.add(cb.equal(root.get("status"), params.getStatus()));
        }

        if (params.getStack() != null) {
            predicates.add(cb.equal(root.get("stack"), params.getStack()));
        }

        if (params.getSalaryMin() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("salaryFrom"), params.getSalaryMin()));
        }

        if (params.getSalaryMax() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("salaryTo"), params.getSalaryMax()));
        }

        query.where(cb.and(predicates.toArray(new Predicate[0])));

        // сортировка
//        if ("asc".equalsIgnoreCase(params.getSortDirection())) {
//            query.orderBy(cb.asc(root.get(params.getSortBy())));
//        } else {
//            query.orderBy(cb.desc(root.get(params.getSortBy())));
//        }


        query.where(cb.and(predicates.toArray(new Predicate[0])));
        query.orderBy(cb.asc(root.get("title"))); // сортировка по существующему полю

        TypedQuery<Vacancy> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult(params.getPage() * params.getSize());
        typedQuery.setMaxResults(params.getSize());
        List<Vacancy> content = typedQuery.getResultList();

        List<VacancyResponseDto> vacancies = vacancyMapper.toDto(content);

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Vacancy> countRoot = countQuery.from(Vacancy.class);

        List<Predicate> countPredicates = new ArrayList<>();
        if (params.getCity() != null) {
            countPredicates.add(cb.equal(countRoot.get("city"), params.getCity()));
        }

        if (params.getSource() != null && !params.getSource().isEmpty()) {
            countPredicates.add(countRoot.get("source").in(params.getSource()));
        }

        if (params.getCity() != null) {
            countPredicates.add(cb.equal(countRoot.get("city"), params.getCity()));
        }

        if (params.getStatus() != null) {
            countPredicates.add(cb.equal(countRoot.get("status"), params.getStatus()));
        }

        if (params.getStack() != null) {
            countPredicates.add(cb.equal(countRoot.get("stack"), params.getStack()));
        }

        if (params.getSalaryMin() != null) {
            countPredicates.add(cb.greaterThanOrEqualTo(countRoot.get("salaryFrom"), params.getSalaryMin()));
        }

        if (params.getSalaryMax() != null) {
            countPredicates.add(cb.lessThanOrEqualTo(countRoot.get("salaryTo"), params.getSalaryMax()));
        }

        countQuery.select(cb.count(countRoot));
        countQuery.where(cb.and(countPredicates.toArray(new Predicate[0])));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(vacancies, PageRequest.of(params.getPage(), params.getSize()), total);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record HhVacancy(
            String id,
            String description,
            @JsonProperty("key_skills") List<HhKeySkill> keySkills
    ) {
    }

    public Vacancy getActiveVacancy(String publicId) {
        return vacancyRepository.findActiveVacancyByPublicId(publicId).orElse(null);
    }

    public ResponseEntity<Object> createVacancy(User user, NewVacancyDto newVacancy){
        Vacancy vacancy = vacancyMapper.fromDto(newVacancy);
        vacancy.setEmployer(user);

        Vacancy finalVacancy = vacancy;
        vacancy.setContacts(newVacancy.getContactsList().stream().map(contact ->
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

    public void fetchAndSave(Stack stack) {

        VacancySource vacancySource = vacancySourceService.getVacancySourceByCode("HH");

        if (vacancySource != null && vacancySource.isActive()) {

            int page = 0;

            while (true) {
                try {
                    int finalPage = page;
                    HhVacancyListResponse response = webClient.get()
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
                            hhAggregationService.saveVacancy(item, vacancySource, stack).join();
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

}
