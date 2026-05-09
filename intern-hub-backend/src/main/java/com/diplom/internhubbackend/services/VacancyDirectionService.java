package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.VacancyDirection;
import com.diplom.internhubbackend.repositories.VacancyDirectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VacancyDirectionService {

    public static final String DEVELOPMENT = "development";
    public static final String DESIGN = "design";
    public static final String MANAGEMENT = "management";
    public static final String QA = "qa";
    public static final String DEVOPS = "devops";
    public static final String ANALYTICS = "analytics";
    public static final String DATA_AI = "data_ai";
    public static final String SECURITY = "security";

    private static final Map<String, String> DEFAULT_DIRECTIONS = buildDefaultDirections();

    private final VacancyDirectionRepository vacancyDirectionRepository;

    @Transactional
    public VacancyDirection getOrCreate(String id) {
        String name = DEFAULT_DIRECTIONS.get(id);
        if (name == null) {
            return null;
        }

        return vacancyDirectionRepository.findById(id)
                .orElseGet(() -> vacancyDirectionRepository.save(
                        VacancyDirection.builder()
                                .id(id)
                                .name(name)
                                .build()
                ));
    }

    @Transactional
    public Map<String, VacancyDirection> getDefaultDirectionsById() {
        return DEFAULT_DIRECTIONS.keySet().stream()
                .map(this::getOrCreate)
                .collect(Collectors.toMap(
                        VacancyDirection::getId,
                        direction -> direction,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
    }

    private static Map<String, String> buildDefaultDirections() {
        Map<String, String> directions = new LinkedHashMap<>();
        directions.put(DEVELOPMENT, "Разработка");
        directions.put(DESIGN, "Дизайн");
        directions.put(MANAGEMENT, "Менеджеры");
        directions.put(QA, "Тестировщики");
        directions.put(DEVOPS, "DevOps");
        directions.put(ANALYTICS, "Аналитики");
        directions.put(DATA_AI, "Data Science и AI");
        directions.put(SECURITY, "Безопасность");
        return Map.copyOf(directions);
    }
}
