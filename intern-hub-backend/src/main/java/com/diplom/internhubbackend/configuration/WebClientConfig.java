package com.diplom.internhubbackend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {

        final int size = (int) DataSize.ofMegabytes(16).toBytes();

        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(size))
                .build();

        return WebClient.builder()
                .baseUrl("https://api.hh.ru")
                .defaultHeader("User-Agent", "VacancyPlatform/1.0 (integration@platform.com)")
                .exchangeStrategies(strategies)
                .build();
    }
}
