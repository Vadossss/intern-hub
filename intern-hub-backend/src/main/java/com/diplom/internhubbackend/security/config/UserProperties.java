package com.diplom.internhubbackend.security.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties("spring.security.user")
@Configuration
@Data
public class UserProperties {
    private String email;
    private String password;

}
