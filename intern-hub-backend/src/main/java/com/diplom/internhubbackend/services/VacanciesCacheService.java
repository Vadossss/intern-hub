package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.models.VacancyCache;
import com.diplom.internhubbackend.models.dto.FilterParams;
import com.diplom.internhubbackend.models.enums.VacancySource;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class VacanciesCacheService {
    private final RedisTemplate<String, VacancyCache> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    private static final String INDEX_NAME = "vacancy_idx";
    private static final String ALL_HASH = "vacancies";

    private final VacancyRepository vacancyRepository;

    private boolean indexExists(String index) {
        try {
            redisTemplate.execute((RedisCallback<Object>) c ->
                    c.execute("FT.INFO", index.getBytes())
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @PostConstruct
    public void init() {
        try {
            redisTemplate.execute((RedisCallback<Object>) connection -> {
                connection.execute("FT.INFO", INDEX_NAME.getBytes());
                return null;
            });
            log.info("RediSearch index '{}' already exists", INDEX_NAME);
        } catch (Exception e) {
            try {
                redisTemplate.execute((RedisCallback<Object>)   connection -> {
                    createIndex(connection);
                    return null;
                });
                log.info("RediSearch index '{}' created", INDEX_NAME);
            } catch (Exception ex) {
                log.warn("RediSearch init skipped: {}", ex.getMessage());
            }
        }
    }

    private void createIndex(RedisConnection connection) {
        connection.execute(
                "FT.CREATE",
                INDEX_NAME.getBytes(),
                "ON".getBytes(), "HASH".getBytes(),
                "PREFIX".getBytes(), "1".getBytes(), "vacancy:".getBytes(),
                "SCHEMA".getBytes(),
                "name".getBytes(), "TEXT".getBytes(),
                "city".getBytes(), "TAG".getBytes(),
                "source".getBytes(), "TAG".getBytes(),
                "position".getBytes(), "TAG".getBytes(),
                "schedule".getBytes(), "TAG".getBytes(),
                "employmentForm".getBytes(), "TAG".getBytes(),
                "salary".getBytes(), "TEXT".getBytes()
        );
    }

//    public void initSearchIndex() {
//        try {
//            try {
//                redisTemplate.execute((RedisCallback<Object>) connection -> {
//                    connection.execute("FT.INFO", SEARCH_INDEX.getBytes());
//                    return null;
//                });
//                log.info("Индекс RediSearch уже существует: {}", SEARCH_INDEX);
//                return;
//            } catch (Exception e) {
//                log.info("Создание нового индекса RediSearch: {}", SEARCH_INDEX);
//            }
//
//            try {
//                redisTemplate.execute((RedisCallback<Object>) connection -> {
//                    connection.execute("FT.DROPINDEX", SEARCH_INDEX.getBytes());
//                    return null;
//                });
//                log.info("Старый индекс удален");
//            } catch (Exception e) {
//
//            }
//
//            redisTemplate.execute((RedisCallback<Object>) connection ->
//                    connection.execute(
//                            "FT.CREATE",
//                            SEARCH_INDEX.getBytes(),
//                            "ON".getBytes(), "HASH".getBytes(),
//                            "PREFIX".getBytes(), "1".getBytes(), "vacancy:".getBytes(),
//                            "SCHEMA".getBytes(),
//                            "name".getBytes(), "TEXT".getBytes(), "WEIGHT".getBytes(), "5.0".getBytes(),
//                            "city".getBytes(), "TAG".getBytes(),
//                            "source".getBytes(), "TAG".getBytes(),
//                            "position".getBytes(), "TAG".getBytes(),
//                            "schedule".getBytes(), "TAG".getBytes(),
//                            "employmentForm".getBytes(), "TAG".getBytes(),
//                            "salary".getBytes(), "TEXT".getBytes(),
//                            "salary_numeric".getBytes(), "NUMERIC".getBytes()
//                    )
//            );
//
//            log.info("Индекс RediSearch успешно создан: {}", SEARCH_INDEX);
//
//        } catch (Exception e) {
//            log.error("Ошибка при создании индекса RediSearch: {}", e.getMessage());
//        }
//    }

    public void save(String id, VacancySource source, Stack stack,
                     String name, String schedule, String employment,
                     String city, String salary) {
        try {
            Map<String, String> hashFields = new HashMap<>();
            hashFields.put("name", name != null ? name : "");
            hashFields.put("city", city != null ? city : "");
            hashFields.put("source", source != null ? source.name() : "");
            hashFields.put("position", stack.getName() != null ? stack.getName() : "");
            hashFields.put("schedule", schedule != null ? schedule : "");
            hashFields.put("employmentForm", employment != null ? employment : "");
            hashFields.put("salary", salary != null ? salary : "");
//            Double numericSalary = internship.getNumericSalary();
//            hashFields.put("salary_numeric", String.valueOf(numericSalary != null ? numericSalary : 0.0));

            String hashKey = "vacancy:" + id;
            redisTemplate.opsForHash().putAll(hashKey, hashFields);

            redisTemplate.expire(hashKey, 7200, java.util.concurrent.TimeUnit.SECONDS);

            log.debug("Сохранена вакансия в RediSearch: {}", id);
        } catch (Exception e) {
            log.error("Ошибка при сохранении для RediSearch: {}", e.getMessage());
        }
    }

    public void save(VacancyCache vacancyCache) {
        redisTemplate.opsForHash()
                .put(ALL_HASH, vacancyCache.getId(), vacancyCache);
    }

//    private void saveForRediSearch(VacancyCache internship) {
//        try {
//            Map<String, String> hashFields = new HashMap<>();
//            hashFields.put("name", internship.getName() != null ? internship.getName() : "");
//            hashFields.put("city", internship.getCity() != null ? internship.getCity() : "");
//            hashFields.put("source", internship.getSource() != null ? internship.getSource().name() : "");
//            hashFields.put("position", internship.getPosition() != null ? internship.getPosition() : "");
//            hashFields.put("schedule", internship.getSchedule() != null ? internship.getSchedule() : "");
//            hashFields.put("employmentForm", internship.getEmploymentForm() != null ? internship.getEmploymentForm() : "");
//            hashFields.put("salary", internship.getSalary() != null ? internship.getSalary() : "");
//
//            Double numericSalary = internship.getNumericSalary();
//            hashFields.put("salary_numeric", String.valueOf(numericSalary != null ? numericSalary : 0.0));
//
//            String hashKey = "vacancy:" + internship.getId();
//            redisTemplate.opsForHash().putAll(hashKey, hashFields);
//
//            redisTemplate.expire(hashKey, 7200, java.util.concurrent.TimeUnit.SECONDS);
//
//            log.debug("Сохранена вакансия в RediSearch: {}", internship.getId());
//        } catch (Exception e) {
//            log.error("Ошибка при сохранении для RediSearch: {}", e.getMessage());
//        }
//    }

    public List<VacancyCache> searchWithRediSearch(FilterParams params) {
        try {
            StringBuilder queryBuilder = new StringBuilder();

            // Базовый запрос по источнику
            if (params.getSource() != null) {
                queryBuilder.append("@source:{").append(params.getSource().name()).append("}");
            } else {
                queryBuilder.append("@source:{HH|SUPERJOB}");
            }

//            // Фильтрация по городу
//            if (params.getCity() != null && !params.getCity().isBlank()) {
//                queryBuilder.append(" @city:{").append(escapeTag(params.getCity())).append("}");
//            }

            // Фильтрация по позиции
            if (params.getPosition() != null && !params.getPosition().isBlank()) {
                queryBuilder.append(" @position:{").append(escapeTag(params.getPosition())).append("}");
            }

//            // Фильтрация по графику
//            if (params.getSchedule() != null && !params.getSchedule().isBlank()) {
//                queryBuilder.append(" @schedule:{").append(escapeTag(params.getSchedule())).append("}");
//            }
//
//            // Фильтрация по типу занятости
//            if (params.getEmployment() != null && !params.getEmployment().isBlank()) {
//                queryBuilder.append(" @employmentForm:{").append(escapeTag(params.getEmployment())).append("}");
//            }
//
//            // Поиск по тексту в названии
//            if (params.getSearchText() != null && !params.getSearchText().isBlank()) {
//                queryBuilder.append(" @name:").append(escapeText(params.getSearchText()));
//            }
//
//            // Фильтрация по зарплате
//            if (params.getSalaryMin() != null || params.getSalaryMax() != null) {
//                queryBuilder.append(" @salary_numeric:[");
//                queryBuilder.append(params.getSalaryMin() != null ? params.getSalaryMin() : "-inf");
//                queryBuilder.append(" ");
//                queryBuilder.append(params.getSalaryMax() != null ? params.getSalaryMax() : "+inf");
//                queryBuilder.append("]");
//            }

            String query = queryBuilder.toString();
            log.info("Поиск по запросу: {}", query);

            int limit = params.getSize() != null ? params.getSize() : 50;
            int offset = params.getPage() != null ? params.getPage() * limit : 0;

//
//            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                    (List<Object>) connection.execute(
//                            "FT.SEARCH",
//                            SEARCH_INDEX.getBytes(),
//                            query.getBytes(),
//                            "LIMIT".getBytes(),
//                            String.valueOf(offset).getBytes(),
//                            String.valueOf(limit).getBytes()
//                    )
//            );

//            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                    (List<Object>) connection.execute(
//                            "FT.SEARCH",
//                            INDEX_NAME.getBytes(),
//                            query.getBytes(),
//                            "LIMIT".getBytes(),
//                            "0".getBytes(),
//                            "100".getBytes()
//                    ));

//

//            Object result = redisTemplate.getConnectionFactory().getConnection().commands().;

//            log.info("Результаты поиска: {}", result);

//            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                    (List<Object>) connection.execute(
//                            "FT.SEARCH",
//                            SEARCH_INDEX.getBytes(),
//                            query.getBytes(),
//                            "LIMIT".getBytes(),
//                            String.valueOf(offset).getBytes(),
//                            String.valueOf(limit).getBytes()
//                    ));

    //            if (result == null || result.size() < 2) {
    //                return Collections.emptyList();
    //            }
            return filterByParamsFallback(params);
//            return parseSearchResult(result);

        } catch (Exception e) {
            log.error("Ошибка при поиске через RediSearch", e);
            return filterByParamsFallback(params);
        }
    }

    private List<VacancyCache> parseSearchResult(List<Object> result) {
        List<VacancyCache> list = new ArrayList<>();

        for (int i = 1; i < result.size(); i += 2) {
            String key = (String) result.get(i);

            Map<Object, Object> fields =
                    redisTemplate.opsForHash().entries(key);

            if (fields.isEmpty()) continue;

            VacancyCache v = new VacancyCache();
            v.setId(key.replace("vacancy:", ""));
            v.setName((String) fields.get("name"));
            v.setCity((String) fields.get("city"));
            v.setSource(VacancySource.valueOf((String) fields.get("source")));
            v.setPosition((String) fields.get("position"));
            v.setSchedule((String) fields.get("schedule"));
            v.setEmploymentForm((String) fields.get("employmentForm"));
            v.setSalary((String) fields.get("salary"));

            list.add(v);
        }

        return list;
    }

    private List<VacancyCache> filterByParamsFallback(FilterParams params) {
        List<VacancyCache> allVacancies = getAll();
        log.info("Всего вакансий: {}", allVacancies.size());

        return allVacancies.stream()
                .filter(v -> params.getSource() == null || v.getSource() == params.getSource())
                .filter(v -> params.getPosition() == null || params.getPosition().isBlank() ||
                        (v.getPosition() != null && v.getPosition().toLowerCase()
                                .contains(params.getPosition().toLowerCase())))
                .filter(v -> params.getCity() == null || params.getCity().isBlank() ||
                        (v.getCity() != null && v.getCity().equalsIgnoreCase(params.getCity())))
                .filter(v -> params.getSchedule() == null || params.getSchedule().isBlank() ||
                        (v.getSchedule() != null && v.getSchedule().equalsIgnoreCase(params.getSchedule())))
                .filter(v -> params.getEmployment() == null || params.getEmployment().isBlank() ||
                        (v.getEmploymentForm() != null && v.getEmploymentForm().equalsIgnoreCase(params.getEmployment())))
                .filter(v -> params.getSearchText() == null || params.getSearchText().isBlank() ||
                        (v.getName() != null && v.getName().toLowerCase()
                                .contains(params.getSearchText().toLowerCase())))
                .collect(Collectors.toList());
    }

    private boolean filterBySalary(Double salary, String min, String max) {
        if ((min == null || min.isBlank()) && (max == null || max.isBlank())) {
            return true;
        }

        if (salary == null || salary == 0.0) {
            return false;
        }

        try {
            double minValue = min != null && !min.isBlank() ? Double.parseDouble(min) : Double.MIN_VALUE;
            double maxValue = max != null && !max.isBlank() ? Double.parseDouble(max) : Double.MAX_VALUE;

            return salary >= minValue && salary <= maxValue;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public List<VacancyCache> fullTextSearch(String searchTerm) {
        if (searchTerm == null || searchTerm.isBlank()) {
            return getAll();
        }

        try {
            String query = "@name:" + escapeText(searchTerm) +
                    " | @position:" + escapeText(searchTerm) +
                    " | @city:" + escapeText(searchTerm);

            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
                    (List<Object>) connection.execute(
                            "FT.SEARCH",
                            INDEX_NAME.getBytes(),
                            query.getBytes(),
                            "LIMIT".getBytes(),
                            "0".getBytes(),
                            "100".getBytes()
                    ));

            if (result == null || result.size() < 2) {
                return Collections.emptyList();
            }

            return parseSearchResult(result);

        } catch (Exception e) {
            return fullTextSearchFallback(searchTerm);
        }
    }

    private List<VacancyCache> fullTextSearchFallback(String searchTerm) {
        String term = searchTerm.toLowerCase();
        return getAll().stream()
                .filter(v ->
                        (v.getName() != null && v.getName().toLowerCase().contains(term)) ||
                                (v.getPosition() != null && v.getPosition().toLowerCase().contains(term)) ||
                                (v.getCity() != null && v.getCity().toLowerCase().contains(term)) ||
                                (v.getSchedule() != null && v.getSchedule().toLowerCase().contains(term)) ||
                                (v.getEmploymentForm() != null && v.getEmploymentForm().toLowerCase().contains(term))
                )
                .collect(Collectors.toList());
    }

    public List<String> getDistinctCities() {
        try {
            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
                    (List<Object>) connection.execute(
                            "FT.AGGREGATE",
                            INDEX_NAME.getBytes(),
                            "*".getBytes(),
                            "GROUPBY".getBytes(),
                            "1".getBytes(),
                            "@city".getBytes(),
                            "REDUCE".getBytes(),
                            "COUNT".getBytes(),
                            "0".getBytes(),
                            "SORTBY".getBytes(),
                            "2".getBytes(),
                            "@__key".getBytes(),
                            "DESC".getBytes()
                    ));

            if (result == null || result.size() < 2) {
                return Collections.emptyList();
            }

            List<String> cities = new ArrayList<>();
            for (int i = 1; i < result.size(); i++) {
                List<Object> row = (List<Object>) result.get(i);
                if (row.size() >= 2) {
                    cities.add((String) row.get(1));
                }
            }

            return cities.stream()
                    .filter(city -> city != null && !city.isBlank())
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

        } catch (Exception e) {
            return getAll().stream()
                    .map(VacancyCache::getCity)
                    .filter(Objects::nonNull)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
        }
    }


    public List<VacancyCache> getAll() {
        return redisTemplate.opsForHash()
                .values(ALL_HASH)
                .stream()
                .map(o -> (VacancyCache) o)
                .collect(Collectors.toList());
    }

    public void clearAll() {
        try {
            redisTemplate.execute((RedisCallback<Object>) connection -> {
                try {
                    connection.execute("FT.DROPINDEX", INDEX_NAME.getBytes());
                } catch (Exception e) {

                }
                return null;
            });

            Set<String> keys = redisTemplate.keys("vacancy:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }



        } catch (Exception e) {

        }
    }

    private String escapeTag(String value) {
        return value.replaceAll("[ ,\\.\\-]", "\\\\$0");
    }

    private String escapeText(String value) {
        return "\"" + value.replaceAll("[\"\\\\]", "\\\\$0") + "\"";
    }

//    public void initSearchIndex() {
//        String createIndexCommand = "FT.CREATE internshipIdx ON HASH PREFIX 1 internship: SCHEMA "
//                + "name TEXT WEIGHT 5.0 "
//                + "city TAG "
//                + "source TAG "
//                + "position TAG "
//                + "schedule TAG "
//                + "employment TAG "
//                + "salary NUMERIC SORTABLE";
//
//        redisTemplate.execute((RedisCallback<Object>) connection -> {
//            connection.execute(createIndexCommand);
//            return null;
//        });
//    }
//
//    public List<InternshipCache> searchWithRediSearch(FilterParams params) {
//        StringBuilder query = new StringBuilder("@source:");
//        query.append(params.getSource() != null ? params.getSource().name() : "{HH|SUPERJOB}");
//
//        if (params.getCity() != null && !params.getCity().isBlank()) {
//            query.append(" @city:{").append(params.getCity()).append("}");
//        }
//
//        if (params.getPosition() != null && !params.getPosition().isBlank()) {
//            query.append(" @position:{").append(params.getPosition()).append("}");
//        }
//
//        if (params.getSalaryMin() != null || params.getSalaryMax() != null) {
//            query.append(" @salary:[");
//            query.append(params.getSalaryMin() != null ? params.getSalaryMin() : "-inf");
//            query.append(" ");
//            query.append(params.getSalaryMax() != null ? params.getSalaryMax() : "+inf");
//            query.append("]");
//        }
//
//        String searchCommand = "FT.SEARCH internshipIdx \"" + query.toString() + "\" LIMIT 0 100";
//
//        List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                (List<Object>) connection.execute(searchCommand));
//
//        return parseSearchResult(result);
//    }
//
//    public void save(String id, VacancySource source, PositionsEnum position,
//                     String name, String schedule, String employment,
//                     String city, String salary) {
//        InternshipCache internship = new InternshipCache();
//        internship.setId(id);
//        internship.setSource(source);
//        internship.setPosition(position.getFullName());
//        internship.setName(name);
//        internship.setSchedule(schedule);
//        internship.setEmployment(employment);
//        internship.setCity(city);
//        internship.setSalary(salary);
//
//        // Также сохраняем в репозиторий, если нужно
//        repository.save(internship);
//    }
//
//    private void addIndex(String indexName, String value, String id) {
//        if (value == null || value.isBlank()) return;
//        redisTemplate.opsForSet().add(indexName + ":" + value, id);
//    }



//    public Iterable<InternshipCache> getAll() {
//        return repository.findAll();
//    }

//    public void cacheFromDB(Stack stack) {
//        List<Vacancy> vacancies = vacancyRepository.findByStack(stack);
//        for (Vacancy vacancy : vacancies) {
//            VacancyCache vacancyCache = new VacancyCache();
//            vacancyCache.setId("ih_" + vacancy.getId());
//            vacancyCache.setSource(VacancySource.INTERNHUB);
//            vacancyCache.setName(vacancy.getTitle());
//            vacancyCache.setCity(vacancy.getCity());
//            vacancyCache.setSchedule(vacancy.getWorkFormat().getName());
//            vacancyCache.setEmploymentForm(vacancy.getEmployment().getName());
//
//            vacancyCache.setSalary(vacancy.getSalaryFrom() != null ? vacancy.getSalaryTo() != null ?
//                    vacancy.getSalaryFrom() + "-" + vacancy.getSalaryTo() + " " + vacancy.getCurrency().getAbbr() :
//                    vacancy.getSalaryFrom().toString() + " " + vacancy.getCurrency().getAbbr() : "Не указано");
//
//            cacheService.save(vacancyCache.getId(), vacancyCache.getSource(), stack, vacancyCache.getName(),
//                    vacancyCache.getSchedule(), vacancyCache.getEmploymentForm(), vacancyCache.getCity(),
//                    vacancyCache.getSalary());
//        }
//    }
}



//package com.diplom.internhubbackend.services;
//
//import com.diplom.internhubbackend.models.Stack;
//import com.diplom.internhubbackend.models.Vacancy;
//import com.diplom.internhubbackend.models.VacancyCache;
//import com.diplom.internhubbackend.models.dto.CityResponseDto;
//import com.diplom.internhubbackend.models.dto.FilterParams;
//import com.diplom.internhubbackend.models.enums.VacancySource;
//import com.diplom.internhubbackend.repositories.VacanciesCacheRepository;
//import com.diplom.internhubbackend.repositories.VacancyRepository;
//import jakarta.annotation.PostConstruct;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.redis.core.RedisCallback;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Service;
//
//import java.util.*;
//import java.util.concurrent.TimeUnit;
//import java.util.stream.Collectors;
//
//@Service
//@Slf4j
//@RequiredArgsConstructor
//public class VacanciesCacheService {
//    private final RedisTemplate<String, VacancyCache> redisTemplate;
//
//    private static final String INTERNSHIP_HASH = "vacancy";
//    private static final String SEARCH_INDEX = "vacancyIdx";
//
//    private final VacancyRepository vacancyRepository;
//    private final VacanciesCacheRepository vacanciesCacheRepository;
////    private final VacanciesCacheService cacheService;
//
//    @PostConstruct
//    public void init() {
//        try {
//            // 1️⃣ Создаём индекс RediSearch
//            initSearchIndex();
//
//            // 2️⃣ Загружаем все вакансии из базы и сохраняем в Redis
//            Iterable<VacancyCache> allVacancies = vacanciesCacheRepository.findAll();
//            allVacancies.forEach(this::saveVacancyToRedis);
//
//        } catch (Exception e) {
//            log.error("Ошибка при инициализации RediSearch", e);
//        }
//    }
//
//    public void initSearchIndex() {
////        try {
////            try {
////                redisTemplate.execute((RedisCallback<Object>) connection -> {
////                    connection.execute("FT.INFO", SEARCH_INDEX.getBytes());
////                    return null;
////                });
////                log.info("Индекс RediSearch уже существует: {}", SEARCH_INDEX);
////                return;
////            } catch (Exception e) {
////                log.info("Создание нового индекса RediSearch: {}", SEARCH_INDEX);
////            }
////
////            try {
////                redisTemplate.execute((RedisCallback<Object>) connection -> {
////                    connection.execute("FT.DROPINDEX", SEARCH_INDEX.getBytes());
////                    return null;
////                });
////                log.info("Старый индекс удален");
////            } catch (Exception e) {
////
////            }
////
////            redisTemplate.execute((RedisCallback<Object>) connection ->
////                    connection.execute(
////                            "FT.CREATE",
////                            SEARCH_INDEX.getBytes(),
////                            "ON".getBytes(), "HASH".getBytes(),
////                            "PREFIX".getBytes(), "1".getBytes(), "vacancy:".getBytes(),
////                            "SCHEMA".getBytes(),
////                            "name".getBytes(), "TEXT".getBytes(), "WEIGHT".getBytes(), "5.0".getBytes(),
////                            "city".getBytes(), "TAG".getBytes(),
////                            "source".getBytes(), "TAG".getBytes(),
////                            "position".getBytes(), "TAG".getBytes(),
////                            "schedule".getBytes(), "TAG".getBytes(),
////                            "employmentForm".getBytes(), "TAG".getBytes(),
////                            "salary".getBytes(), "TEXT".getBytes(),
////                            "salary_numeric".getBytes(), "NUMERIC".getBytes()
////                    )
////            );
////
////            log.info("Индекс RediSearch успешно создан: {}", SEARCH_INDEX);
////
////        } catch (Exception e) {
////            log.error("Ошибка при создании индекса RediSearch: {}", e.getMessage());
////        }
//        try {
//            redisTemplate.execute((RedisCallback<Object>) connection -> {
//                try {
//                    connection.execute("FT.DROPINDEX", SEARCH_INDEX.getBytes());
//                } catch (Exception ignored) {}
//                return null;
//            });
//
//            redisTemplate.execute((RedisCallback<Object>) connection ->
//                    connection.execute(
//                            "FT.CREATE",
//                            SEARCH_INDEX.getBytes(),
//                            "ON".getBytes(), "HASH".getBytes(),
//                            "PREFIX".getBytes(), "1".getBytes(), "vacancy:".getBytes(),
//                            "SCHEMA".getBytes(),
//                            "name".getBytes(), "TEXT".getBytes(), "WEIGHT".getBytes(), "5.0".getBytes(),
//                            "city".getBytes(), "TAG".getBytes(),
//                            "source".getBytes(), "TAG".getBytes(),
//                            "position".getBytes(), "TAG".getBytes(),
//                            "schedule".getBytes(), "TAG".getBytes(),
//                            "employmentForm".getBytes(), "TAG".getBytes(),
//                            "salary".getBytes(), "TEXT".getBytes(),
//                            "salary_numeric".getBytes(), "NUMERIC".getBytes()
//                    )
//            );
//
//            log.info("Индекс RediSearch создан: {}", SEARCH_INDEX);
//        } catch (Exception e) {
//            log.error("Ошибка при создании индекса RediSearch", e);
//        }
//    }
//
//    public void save(String id, VacancySource source, Stack stack,
//                     String name, String schedule, String employment,
//                     String city, String salary) {
//        VacancyCache internship = new VacancyCache();
//        internship.setId(id);
//        internship.setSource(source);
//        internship.setPosition(stack != null ? stack.getName() : "");
//        internship.setName(name != null ? name : "");
//        internship.setSchedule(schedule != null ? schedule : "");
//        internship.setEmploymentForm(employment != null ? employment : "");
//        internship.setCity(city != null ? city : "");
//        internship.setSalary(salary != null ? salary : "");
//
//        redisTemplate.opsForHash().put(INTERNSHIP_HASH, id, internship);
//
//        saveVacancyToRedis(internship);
//    }
//
////    private void saveForRediSearch(VacancyCache internship) {
////        try {
////            Map<String, String> hashFields = new HashMap<>();
////            hashFields.put("name", internship.getName() != null ? internship.getName() : "");
////            hashFields.put("city", internship.getCity() != null ? internship.getCity() : "");
////            hashFields.put("source", internship.getSource() != null ? internship.getSource().name() : "");
////            hashFields.put("position", internship.getPosition() != null ? internship.getPosition() : "");
////            hashFields.put("schedule", internship.getSchedule() != null ? internship.getSchedule() : "");
////            hashFields.put("employmentForm", internship.getEmploymentForm() != null ? internship.getEmploymentForm() : "");
////            hashFields.put("salary", internship.getSalary() != null ? internship.getSalary() : "");
////
////            Double numericSalary = internship.getNumericSalary();
////            hashFields.put("salary_numeric", String.valueOf(numericSalary != null ? numericSalary : 0.0));
////
////            String hashKey = "vacancy:" + internship.getId();
////            redisTemplate.opsForHash().putAll(hashKey, hashFields);
////
////            redisTemplate.expire(hashKey, 7200, java.util.concurrent.TimeUnit.SECONDS);
////
////            log.debug("Сохранена вакансия в RediSearch: {}", internship.getId());
////        } catch (Exception e) {
////            log.error("Ошибка при сохранении для RediSearch: {}", e.getMessage());
////        }
////    }
//
//    private void saveVacancyToRedis(VacancyCache vacancy) {
//        try {
//            String id = "vacancy:" + vacancy.getId();
//
//            Map<String, Object> hashFields = new HashMap<>();
//            hashFields.put("name", vacancy.getName() != null ? vacancy.getName() : "");
//            hashFields.put("city", normalizeCity(vacancy.getCity()));
//            hashFields.put("source", vacancy.getSource() != null ? vacancy.getSource().name() : "");
//            hashFields.put("position", vacancy.getPosition() != null ? vacancy.getPosition() : "");
//            hashFields.put("schedule", vacancy.getSchedule() != null ? vacancy.getSchedule() : "");
//            hashFields.put("employmentForm", vacancy.getEmploymentForm() != null ? vacancy.getEmploymentForm() : "");
//            hashFields.put("salary", vacancy.getSalary() != null ? vacancy.getSalary() : "");
//            hashFields.put("salary_numeric", vacancy.getNumericSalary() != null ? vacancy.getNumericSalary() : 0.0);
//
//            // Сохраняем в Redis Hash
//            redisTemplate.opsForHash().putAll(id, hashFields);
//            redisTemplate.expire(id, 7200, TimeUnit.SECONDS);
//
//            // Сохраняем ссылку в общем хеше для быстрого getAll
////            redisTemplate.opsForHash().put(INTERNSHIP_HASH, vacancy.getId(), vacancy);
//
//            log.debug("Сохранена вакансия в Redis и RediSearch: {}", id);
//        } catch (Exception e) {
//            log.error("Ошибка при сохранении вакансии: {}", e.getMessage());
//        }
//    }
//
//    private String normalizeCity(String city) {
//        if (city == null) return "";
//        return city.trim().replace('\u00A0', ' ').toLowerCase();
//    }
//
//    public List<Map<String, Object>> searchAll() {
//        try {
//            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                    (List<Object>) connection.execute(
//                            "FT.SEARCH",
//                            SEARCH_INDEX.getBytes(),
//                            "*".getBytes(),
//                            "LIMIT".getBytes(),
//                            "0".getBytes(),
//                            "1000".getBytes()
//                    )
//            );
//
//            if (result == null || result.size() < 2) return Collections.emptyList();
//
//            List<Map<String, Object>> list = new ArrayList<>();
//            for (int i = 1; i < result.size(); i += 2) {
//                String key = (String) result.get(i);
//                Map<Object, Object> fields = redisTemplate.opsForHash().entries(key);
//                list.add(fields.entrySet().stream()
//                        .collect(Collectors.toMap(e -> e.getKey().toString(), Map.Entry::getValue)));
//            }
//
//            return list;
//        } catch (Exception e) {
//            log.error("Ошибка при searchAll", e);
//            return Collections.emptyList();
//        }
//    }
//
//    public List<CityResponseDto> getDistinctCities() {
//        try {
//            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                    (List<Object>) connection.execute(
//                            "FT.AGGREGATE",
//                            SEARCH_INDEX.getBytes(),
//                            "*".getBytes(),
//                            "GROUPBY".getBytes(), "1".getBytes(), "@city".getBytes(),
//                            "REDUCE".getBytes(), "COUNT".getBytes(), "0".getBytes(), "AS".getBytes(), "count".getBytes(),
//                            "SORTBY".getBytes(), "4".getBytes(), "@count".getBytes(), "DESC".getBytes(), "@city".getBytes(), "ASC".getBytes()
//                    )
//            );
//
//            if (result == null || result.size() < 2) return Collections.emptyList();
//
//            List<CityResponseDto> cities = new ArrayList<>();
//            for (int i = 1; i < result.size(); i++) {
//                List<Object> row = (List<Object>) result.get(i);
//                String city = null;
//                int count = 0;
//                for (int j = 0; j < row.size(); j += 2) {
//                    String key = row.get(j).toString();
//                    String value = row.get(j + 1).toString();
//                    if ("city".equals(key)) city = value;
//                    else if ("count".equals(key)) count = Integer.parseInt(value);
//                }
//                if (city != null && !city.isBlank()) cities.add(new CityResponseDto(city, count));
//            }
//
//            return cities;
//        } catch (Exception e) {
//            log.error("Ошибка при getDistinctCities", e);
//            return Collections.emptyList();
//        }
//    }
//
//    public List<VacancyCache> searchWithRediSearch(FilterParams params) {
//        try {
//            StringBuilder queryBuilder = new StringBuilder();
//
//            // Базовый запрос по источнику
//            if (params.getSource() != null) {
//                queryBuilder.append("@source:{").append(params.getSource().name()).append("}");
//            } else {
//                queryBuilder.append("@source:{HH|SUPERJOB}");
//            }
//
//            // Фильтрация по городу
//            if (params.getCity() != null && !params.getCity().isBlank()) {
//                queryBuilder.append(" @city:{").append(escapeTag(params.getCity())).append("}");
//            }
//
//            // Фильтрация по позиции
//            if (params.getPosition() != null && !params.getPosition().isBlank()) {
//                queryBuilder.append(" @position:{").append(escapeTag(params.getPosition())).append("}");
//            }
//
//            // Фильтрация по графику
//            if (params.getSchedule() != null && !params.getSchedule().isBlank()) {
//                queryBuilder.append(" @schedule:{").append(escapeTag(params.getSchedule())).append("}");
//            }
//
//            // Фильтрация по типу занятости
//            if (params.getEmployment() != null && !params.getEmployment().isBlank()) {
//                queryBuilder.append(" @employmentForm:{").append(escapeTag(params.getEmployment())).append("}");
//            }
//
//            // Поиск по тексту в названии
//            if (params.getSearchText() != null && !params.getSearchText().isBlank()) {
//                queryBuilder.append(" @name:").append(escapeText(params.getSearchText()));
//            }
//
//            // Фильтрация по зарплате
//            if (params.getSalaryMin() != null || params.getSalaryMax() != null) {
//                queryBuilder.append(" @salary_numeric:[");
//                queryBuilder.append(params.getSalaryMin() != null ? params.getSalaryMin() : "-inf");
//                queryBuilder.append(" ");
//                queryBuilder.append(params.getSalaryMax() != null ? params.getSalaryMax() : "+inf");
//                queryBuilder.append("]");
//            }
//
//            String query = queryBuilder.toString();
//
//            int limit = params.getSize() != null ? params.getSize() : 50;
//            int offset = params.getPage() != null ? params.getPage() * limit : 0;
//
//
//            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                    (List<Object>) connection.execute(
//                            "FT.SEARCH",
//                            SEARCH_INDEX.getBytes(),
//                            query.getBytes(),
//                            "LIMIT".getBytes(),
//                            String.valueOf(offset).getBytes(),
//                            String.valueOf(limit).getBytes()
//                    )
//            );
//
////            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
////                    (List<Object>) connection.execute(
////                            "FT.SEARCH",
////                            SEARCH_INDEX.getBytes(),
////                            query.getBytes(),
////                            "LIMIT".getBytes(),
////                            String.valueOf(offset).getBytes(),
////                            String.valueOf(limit).getBytes()
////                    ));
//
//            if (result == null || result.size() < 2) {
//                return Collections.emptyList();
//            }
//
//            return parseSearchResult(result);
//
//        } catch (Exception e) {
//            log.error("Ошибка при поиске через RediSearch", e);
//            return filterByParamsFallback(params);
//        }
//    }
//
//    private List<VacancyCache> parseSearchResult(List<Object> result) {
//        List<VacancyCache> vacancies = new ArrayList<>();
//
//        for (int i = 1; i < result.size(); i += 2) {
//            String hashKey = (String) result.get(i);
//
//            Map<Object, Object> fields = redisTemplate.opsForHash().entries(hashKey);
//            if (fields.isEmpty()) continue;
//
//            VacancyCache v = new VacancyCache();
//            v.setId(hashKey.replace("vacancy:", ""));
//            v.setName((String) fields.get("name"));
//            v.setCity((String) fields.get("city"));
//            v.setSource(VacancySource.valueOf((String) fields.get("source")));
//            v.setPosition((String) fields.get("position"));
//            v.setSchedule((String) fields.get("schedule"));
//            v.setEmploymentForm((String) fields.get("employmentForm"));
//            v.setSalary((String) fields.get("salary"));
//
//
//            vacancies.add(v);
//        }
//
//        return vacancies;
//    }
//
////    private List<VacancyCache> parseSearchResult(List<Object> result) {
////        List<VacancyCache> internships = new ArrayList<>();
////
////        long totalResults = (Long) result.get(0);
////
////        for (int i = 1; i < result.size(); i += 2) {
////            String hashKey = (String) result.get(i);
////
////            if (!hashKey.startsWith("vacancy:")) {
////                continue;
////            }
////
////            String id = hashKey.substring("vacancy:".length());
////            VacancyCache internship = (VacancyCache) redisTemplate.opsForHash()
////                    .get(INTERNSHIP_HASH, id);
////
////            if (internship != null) {
////                internships.add(internship);
////            }
////        }
////
////        return internships;
////    }
//
//    private List<VacancyCache> filterByParamsFallback(FilterParams params) {
//        List<VacancyCache> allVacancies = getAll();
//
//        return allVacancies.stream()
//                .filter(v -> params.getSource() == null || v.getSource() == params.getSource())
//                .filter(v -> params.getPosition() == null || params.getPosition().isBlank() ||
//                        (v.getPosition() != null && v.getPosition().toLowerCase()
//                                .contains(params.getPosition().toLowerCase())))
//                .filter(v -> params.getCity() == null || params.getCity().isBlank() ||
//                        (v.getCity() != null && v.getCity().equalsIgnoreCase(params.getCity())))
//                .filter(v -> params.getSchedule() == null || params.getSchedule().isBlank() ||
//                        (v.getSchedule() != null && v.getSchedule().equalsIgnoreCase(params.getSchedule())))
//                .filter(v -> params.getEmployment() == null || params.getEmployment().isBlank() ||
//                        (v.getEmploymentForm() != null && v.getEmploymentForm().equalsIgnoreCase(params.getEmployment())))
//                .filter(v -> params.getSearchText() == null || params.getSearchText().isBlank() ||
//                        (v.getName() != null && v.getName().toLowerCase()
//                                .contains(params.getSearchText().toLowerCase())))
//                .filter(v -> filterBySalary(v.getNumericSalary(), params.getSalaryMin(), params.getSalaryMax()))
//                .collect(Collectors.toList());
//    }
//
//    private boolean filterBySalary(Double salary, String min, String max) {
//        if ((min == null || min.isBlank()) && (max == null || max.isBlank())) {
//            return true;
//        }
//
//        if (salary == null || salary == 0.0) {
//            return false;
//        }
//
//        try {
//            double minValue = min != null && !min.isBlank() ? Double.parseDouble(min) : Double.MIN_VALUE;
//            double maxValue = max != null && !max.isBlank() ? Double.parseDouble(max) : Double.MAX_VALUE;
//
//            return salary >= minValue && salary <= maxValue;
//        } catch (NumberFormatException e) {
//            return false;
//        }
//    }
//
//    public List<VacancyCache> fullTextSearch(String searchTerm) {
//        if (searchTerm == null || searchTerm.isBlank()) {
//            return getAll();
//        }
//
//        try {
//            String query = "@name:" + escapeText(searchTerm) +
//                    " | @position:" + escapeText(searchTerm) +
//                    " | @city:" + escapeText(searchTerm);
//
//            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
//                    (List<Object>) connection.execute(
//                            "FT.SEARCH",
//                            SEARCH_INDEX.getBytes(),
//                            query.getBytes(),
//                            "LIMIT".getBytes(),
//                            "0".getBytes(),
//                            "100".getBytes()
//                    ));
//
//            if (result == null || result.size() < 2) {
//                return Collections.emptyList();
//            }
//
//            return parseSearchResult(result);
//
//        } catch (Exception e) {
//            return fullTextSearchFallback(searchTerm);
//        }
//    }
//
//    private List<VacancyCache> fullTextSearchFallback(String searchTerm) {
//        String term = searchTerm.toLowerCase();
//        return getAll().stream()
//                .filter(v ->
//                        (v.getName() != null && v.getName().toLowerCase().contains(term)) ||
//                                (v.getPosition() != null && v.getPosition().toLowerCase().contains(term)) ||
//                                (v.getCity() != null && v.getCity().toLowerCase().contains(term)) ||
//                                (v.getSchedule() != null && v.getSchedule().toLowerCase().contains(term)) ||
//                                (v.getEmploymentForm() != null && v.getEmploymentForm().toLowerCase().contains(term))
//                )
//                .collect(Collectors.toList());
//    }
//
////    public List<Object> getDistinctCities() {
////        try {
////            List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
////                    (List<Object>) connection.execute(
////                            "FT.AGGREGATE",
////                            SEARCH_INDEX.getBytes(),
////                            "*".getBytes(),
////
////                            "GROUPBY".getBytes(),
////                            "1".getBytes(),
////                            "@city".getBytes(),
////
////                            "REDUCE".getBytes(),
////                            "COUNT".getBytes(),
////                            "0".getBytes(),
////                            "AS".getBytes(),
////                            "count".getBytes(),
////
////                            "SORTBY".getBytes(),
////                            "4".getBytes(),
////                            "@count".getBytes(),
////                            "DESC".getBytes(),
////                            "@city".getBytes(),
////                            "ASC".getBytes()
////                    ));
////
////            if (result == null || result.size() < 2) {
////                return Collections.emptyList();
////            }
////
////
//////            List<CityResponseDto> cities = new ArrayList<>();
//////
//////            for (int i = 1; i < result.size(); i++) {
//////                List<Object> row = (List<Object>) result.get(i);
//////
//////                String city = null;
//////                int count = 0;
//////
//////                for (int j = 0; j < row.size(); j += 2) {
//////                    String key = row.get(j).toString();
//////                    String value = row.get(j+1).toString();
//////
//////                    if ("city".equals(key)) {
//////                        city = value;
//////                    }
//////                    else if ("count".equals(key)) {
//////                        count = Integer.parseInt(value);
//////                    }
//////                }
//////
//////                if (city != null && !city.isBlank()) {
//////                    cities.add(new CityResponseDto(city, count));
//////                }
//////
//////            }
////
////
////
////            return result;
////
////
////
//////            return cities.stream()
//////                    .filter(city -> city != null && !city.getCityName().isEmpty())
//////                    .distinct()
//////                    .sorted(Comparator.comparing(CityResponseDto::getCityName).reversed())
//////                    .collect(Collectors.toList());
////
////        } catch (Exception e) {
////            return getAll().stream()
////                    .map(VacancyCache -> new CityResponseDto(VacancyCache.getCity(), 1))
////                    .filter(Objects::nonNull)
////                    .distinct()
////                    .sorted(Comparator.comparing(CityResponseDto::getCount).reversed())
////                    .collect(Collectors.toList());
////        }
////    }
//
//
//    public List<VacancyCache> getAll() {
//        return redisTemplate.opsForHash()
//                .values(INTERNSHIP_HASH)
//                .stream()
//                .map(o -> (VacancyCache) o)
//                .collect(Collectors.toList());
//    }
//
//    public void clearAll() {
//        try {
//            redisTemplate.execute((RedisCallback<Object>) connection -> {
//                try {
//                    connection.execute("FT.DROPINDEX", SEARCH_INDEX.getBytes());
//                } catch (Exception e) {
//
//                }
//                return null;
//            });
//
//            Set<String> keys = redisTemplate.keys("vacancy:*");
//            if (keys != null && !keys.isEmpty()) {
//                redisTemplate.delete(keys);
//            }
//
//
//
//        } catch (Exception e) {
//
//        }
//    }
//
//    private String escapeTag(String value) {
//        return value.replaceAll("[ ,\\.\\-]", "\\\\$0");
//    }
//
//    private String escapeText(String value) {
//        return "\"" + value.replaceAll("[\"\\\\]", "\\\\$0") + "\"";
//    }
//
////    public void initSearchIndex() {
////        String createIndexCommand = "FT.CREATE internshipIdx ON HASH PREFIX 1 internship: SCHEMA "
////                + "name TEXT WEIGHT 5.0 "
////                + "city TAG "
////                + "source TAG "
////                + "position TAG "
////                + "schedule TAG "
////                + "employment TAG "
////                + "salary NUMERIC SORTABLE";
////
////        redisTemplate.execute((RedisCallback<Object>) connection -> {
////            connection.execute(createIndexCommand);
////            return null;
////        });
////    }
////
////    public List<InternshipCache> searchWithRediSearch(FilterParams params) {
////        StringBuilder query = new StringBuilder("@source:");
////        query.append(params.getSource() != null ? params.getSource().name() : "{HH|SUPERJOB}");
////
////        if (params.getCity() != null && !params.getCity().isBlank()) {
////            query.append(" @city:{").append(params.getCity()).append("}");
////        }
////
////        if (params.getPosition() != null && !params.getPosition().isBlank()) {
////            query.append(" @position:{").append(params.getPosition()).append("}");
////        }
////
////        if (params.getSalaryMin() != null || params.getSalaryMax() != null) {
////            query.append(" @salary:[");
////            query.append(params.getSalaryMin() != null ? params.getSalaryMin() : "-inf");
////            query.append(" ");
////            query.append(params.getSalaryMax() != null ? params.getSalaryMax() : "+inf");
////            query.append("]");
////        }
////
////        String searchCommand = "FT.SEARCH internshipIdx \"" + query.toString() + "\" LIMIT 0 100";
////
////        List<Object> result = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
////                (List<Object>) connection.execute(searchCommand));
////
////        return parseSearchResult(result);
////    }
////
////    public void save(String id, VacancySource source, PositionsEnum position,
////                     String name, String schedule, String employment,
////                     String city, String salary) {
////        InternshipCache internship = new InternshipCache();
////        internship.setId(id);
////        internship.setSource(source);
////        internship.setPosition(position.getFullName());
////        internship.setName(name);
////        internship.setSchedule(schedule);
////        internship.setEmployment(employment);
////        internship.setCity(city);
////        internship.setSalary(salary);
////
////        // Также сохраняем в репозиторий, если нужно
////        repository.save(internship);
////    }
////
////    private void addIndex(String indexName, String value, String id) {
////        if (value == null || value.isBlank()) return;
////        redisTemplate.opsForSet().add(indexName + ":" + value, id);
////    }
//
//
//
////    public Iterable<InternshipCache> getAll() {
////        return repository.findAll();
////    }
//
////    public void cacheFromDB(Stack stack) {
////        List<Vacancy> vacancies = vacancyRepository.findByStack(stack);
////        for (Vacancy vacancy : vacancies) {
////            VacancyCache vacancyCache = new VacancyCache();
////            vacancyCache.setId("ih_" + vacancy.getId());
////            vacancyCache.setSource(VacancySource.INTERNHUB);
////            vacancyCache.setName(vacancy.getTitle());
////            vacancyCache.setCity(vacancy.getCity());
////            vacancyCache.setSchedule(vacancy.getWorkFormat().getName());
////            vacancyCache.setEmploymentForm(vacancy.getEmployment().getName());
////
////            vacancyCache.setSalary(vacancy.getSalaryFrom() != null ? vacancy.getSalaryTo() != null ?
////                    vacancy.getSalaryFrom() + "-" + vacancy.getSalaryTo() + " " + vacancy.getCurrency().getAbbr() :
////                    vacancy.getSalaryFrom().toString() + " " + vacancy.getCurrency().getAbbr() : "Не указано");
////
////            cacheService.save(vacancyCache.getId(), vacancyCache.getSource(), stack, vacancyCache.getName(),
////                    vacancyCache.getSchedule(), vacancyCache.getEmploymentForm(), vacancyCache.getCity(),
////                    vacancyCache.getSalary());
////        }
////    }
//}
