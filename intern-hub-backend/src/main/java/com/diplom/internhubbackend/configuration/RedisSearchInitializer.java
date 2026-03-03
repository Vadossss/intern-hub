package com.diplom.internhubbackend.configuration;

import com.diplom.internhubbackend.services.VacanciesCacheService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

//@Slf4j
//@Component
//@RequiredArgsConstructor
public class RedisSearchInitializer {

//    private final VacanciesCacheService vacanciesCacheService;

//    @PostConstruct
//    public void init() {
//        try {
//            log.info("Инициализация RediSearch...");
//            vacanciesCacheService.initSearchIndex();
//            log.info("RediSearch инициализирован успешно");
//        } catch (Exception e) {
//            log.warn("Не удалось инициализировать RediSearch. Будет использована обычная фильтрация.", e);
//        }
//    }
}