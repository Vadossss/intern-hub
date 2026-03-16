package com.diplom.internhubbackend.configuration;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("role", "stacks", "workFormat",
                "keySkills", "experience", "employment", "vacancySource", "currency", "vacancy");
    }
}
