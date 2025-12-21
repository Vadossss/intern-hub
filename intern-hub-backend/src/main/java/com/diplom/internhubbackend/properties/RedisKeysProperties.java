package com.diplom.internhubbackend.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "redis.keys")
@Getter
@Setter
public class RedisKeysProperties {
    private KeyProperties vacancy;

    @Getter @Setter
    public static class KeyProperties {
        private Duration timeToLive;
    }
}