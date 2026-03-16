package com.diplom.internhubbackend.security.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "security.jwt")
@Component
@Data
public class JwtProperties {
    private String secret;
    private int accessTokenExpirationTime;
    private long validity;
}
