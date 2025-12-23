package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.models.enums.VacancySource;
import com.diplom.internhubbackend.repositories.StackRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import com.diplom.internhubbackend.repositories.KeySkillRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class VacancyService {
    private final VacancyRepository vacancyRepository;
    private final RestClient defaultRestClient = RestClient.create();
    private final VacanciesCacheService cacheService;
    private final CustomUserDetailsService customUserDetailsService;
    private final StackRepository stackRepository;

    public VacancyService(VacancyRepository vacancyRepository, VacanciesCacheService cacheService,
                          CustomUserDetailsService customUserDetailsService, StackRepository stackRepository) {
        this.vacancyRepository = vacancyRepository;
        this.cacheService = cacheService;
        this.customUserDetailsService = customUserDetailsService;
        this.stackRepository = stackRepository;
    }

    public Vacancy getVacancy(Integer id) {
        return vacancyRepository.findById(id).orElse(null);
    }

    public ResponseEntity<Object> createVacancy(Vacancy vacancy) {
        vacancy.setEmployer(customUserDetailsService.getCurrentUser());
        vacancyRepository.save(vacancy);
        return ResponseEntity.ok().body("Successfully created vacancy");
    }

    @Scheduled(fixedDelay = 1000 * 60 * 30)
//    @Async
    public void cacheAllInternshipsParallel() {
        List<Stack> stacks = stackRepository.findAll();
        for (Stack stack : stacks) {
            CompletableFuture<Void> hhFuture =
                    CompletableFuture.runAsync(() -> cacheFromHh(stack));

            CompletableFuture<Void> sjFuture =
                    CompletableFuture.runAsync(() -> cacheFromSuperJob(stack));

            CompletableFuture<Void> ihFuture =
                    CompletableFuture.runAsync(() -> cacheFromDB(stack));

            CompletableFuture.allOf(hhFuture, sjFuture, ihFuture).join();
        }
    }

    public void cacheFromDB(Stack stack) {
        List<Vacancy> vacancies = vacancyRepository.findByStack(stack);
        for (Vacancy vacancy : vacancies) {
            VacancyCache vacancyCache = new VacancyCache();
            vacancyCache.setId("ih_" + vacancy.getId());
            vacancyCache.setSource(VacancySource.INTERNHUB);
            vacancyCache.setName(vacancy.getTitle());
            vacancyCache.setCity(vacancy.getCity());
            vacancyCache.setSchedule(vacancy.getWorkFormat().getName());
            vacancyCache.setEmploymentForm(vacancy.getEmployment().getName());

            vacancyCache.setSalary(vacancy.getSalaryFrom() != null ? vacancy.getSalaryTo() != null ?
                    vacancy.getSalaryFrom() + "-" + vacancy.getSalaryTo() + " " + vacancy.getCurrency().getAbbr() :
                    vacancy.getSalaryFrom().toString() + " " + vacancy.getCurrency().getAbbr() : "Не указано");

            cacheService.save(vacancyCache.getId(), vacancyCache.getSource(), stack, vacancyCache.getName(),
                    vacancyCache.getSchedule(), vacancyCache.getEmploymentForm(), vacancyCache.getCity(),
                    vacancyCache.getSalary());
        }
    }

    private void cacheFromHh(Stack stack) {

        ObjectMapper mapper = new ObjectMapper();
        int page = 0;

        while (true) {

            String response = defaultRestClient.get()
                    .uri(String.format(
                            "https://api.hh.ru/vacancies?text=%s&vacancy_search_fields=name&per_page=100&page=%d",
                            stack.getSearchQuery(), page
                    ))
                    .retrieve()
                    .body(String.class);

            try {
                JsonNode root = mapper.readTree(response);
                JsonNode items = root.path("items");
                int pages = root.path("pages").asInt(0);

                if (!items.isArray() || items.size() == 0) break;

                for (JsonNode item : items) {

                    VacancyCache internship = new VacancyCache();
                    internship.setId("hh_" + item.path("id").asText(""));
                    internship.setSource(VacancySource.HH);
                    internship.setName(item.path("name").asText(""));
                    internship.setCity(item.path("area").path("name").asText(""));
                    internship.setSchedule(item.path("schedule").path("name").asText(""));
                    internship.setEmploymentForm(item.path("employment").path("name").asText(""));

                    JsonNode salary = item.path("salary");
                    internship.setSalary(
                            salary.isNull()
                                    ? "Не указана"
                                    : salary.path("to").isNull()
                                    ? salary.path("from").asText("") + " " + salary.path("currency").asText("")
                                    : salary.path("from").asText("") + " - " + salary.path("to").asText("") + " " + salary.path("currency").asText("")
                    );

                    cacheService.save(
                            internship.getId(),
                            internship.getSource(),
                            stack,
                            internship.getName(),
                            internship.getSchedule(),
                            internship.getEmploymentForm(),
                            internship.getCity(),
                            internship.getSalary()
                    );
                }

                page++;
                if (page >= pages) break;

            } catch (Exception e) {
                throw new RuntimeException("Ошибка HH", e);
            }
        }
    }

    private void cacheFromSuperJob(Stack stack) {

        ObjectMapper mapper = new ObjectMapper();
        int page = 0;

        while (true) {

            String response = defaultRestClient.get()
                    .uri(String.format(
                            "https://api.superjob.ru/2.0/vacancies/?keyword=%s&page=%d&count=100",
                            stack.getName(), page
                    ))
                    .header("X-Api-App-Id", "v3.r.139494775.f8cc382c6607a8dc9c09242364d405c3fe433e64.4727dc0e17e4b7b6442cb4b384574c035e970d50")
                    .retrieve()
                    .body(String.class);

            try {
                JsonNode root = mapper.readTree(response);
                JsonNode items = root.path("objects");
                boolean hasMore = root.path("more").asBoolean(false);

                if (!items.isArray() || items.size() == 0) break;

                for (JsonNode item : items) {

                    VacancyCache internship = new VacancyCache();
                    internship.setId("sj_" + item.path("id").asText(""));
                    internship.setSource(VacancySource.SUPERJOB);
                    internship.setName(item.path("profession").asText(""));
                    internship.setCity(item.path("town").path("title").asText(""));
                    internship.setSchedule(item.path("type_of_work").path("title").asText(""));
                    internship.setEmploymentForm(item.path("place_of_work").path("title").asText(""));

                    int from = item.path("payment_from").asInt(0);
                    int to = item.path("payment_to").asInt(0);
                    String currency = item.path("currency").asText("");

                    internship.setSalary(
                            (from == 0 && to == 0)
                                    ? "Не указана"
                                    : from + " - " + to + " " + currency
                    );

                    cacheService.save(
                            internship.getId(),
                            internship.getSource(),
                            stack,
                            internship.getName(),
                            internship.getSchedule(),
                            internship.getEmploymentForm(),
                            internship.getCity(),
                            internship.getSalary()
                    );
                }

                if (!hasMore) break;
                page++;

            } catch (Exception e) {
                throw new RuntimeException("Ошибка SuperJob", e);
            }
        }
    }
}
