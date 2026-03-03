package com.diplom.internhubbackend.configuration;

import com.diplom.internhubbackend.models.VacancyCache;
import com.diplom.internhubbackend.properties.RedisKeysProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisKeyValueAdapter;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@RequiredArgsConstructor
@EnableRedisRepositories(enableKeyspaceEvents = RedisKeyValueAdapter.EnableKeyspaceEvents.ON_STARTUP)
@EnableConfigurationProperties(RedisKeysProperties.class)
public class RedisConfiguration {
    private final RedisKeysProperties properties;

    @Bean
    public RedisTemplate<String, VacancyCache> redisTemplate(
            RedisConnectionFactory factory
    ) {
        RedisTemplate<String, VacancyCache> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);


        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer();

        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}