package com.diplom.internhubbackend.configuration;

import com.diplom.internhubbackend.models.VacancyCache;
import com.diplom.internhubbackend.properties.RedisKeysProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisKeyValueAdapter;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.convert.KeyspaceConfiguration;
import org.springframework.data.redis.core.convert.MappingConfiguration;
import org.springframework.data.redis.core.index.IndexConfiguration;
import org.springframework.data.redis.core.mapping.RedisMappingContext;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableRedisRepositories(enableKeyspaceEvents = RedisKeyValueAdapter.EnableKeyspaceEvents.ON_STARTUP)
@EnableConfigurationProperties(RedisKeysProperties.class)
public class RedisConfiguration {
    private final RedisKeysProperties properties;

    @Bean
    public RedisTemplate<String, VacancyCache> internshipRedisTemplate(
            RedisConnectionFactory factory,
            ObjectMapper objectMapper
    ) {
        RedisTemplate<String, VacancyCache> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        Jackson2JsonRedisSerializer<VacancyCache> serializer =
                new Jackson2JsonRedisSerializer<>(objectMapper, VacancyCache.class);

        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisMappingContext keyValueMappingContext() {
        return new RedisMappingContext(
                new MappingConfiguration(new IndexConfiguration(), new CustomKeyspaceConfiguration()));
    }

    public class CustomKeyspaceConfiguration extends KeyspaceConfiguration {

        @Override
        protected Iterable<KeyspaceSettings> initialConfiguration() {
            return List.of(
                    customKeyspaceSettings(VacancyCache.class, CacheName.VACANCY, properties.
                            getVacancy().getTimeToLive().toSeconds())
            );
        }

        private <T> KeyspaceSettings customKeyspaceSettings(Class<T> type, String keyspace, long ttlSeconds) {
            KeyspaceSettings settings = new KeyspaceSettings(type, keyspace);
            settings.setTimeToLive(ttlSeconds);
            return settings;
        }
    }

    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    public static class CacheName {
        public static final String VACANCY = "vacancy";
    }
}