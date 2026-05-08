package com.diplom.internhubbackend.configuration;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.unit.DataSize;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${hh.api.key}")
    private String hhApiKey;

    @Bean
    public WebClient.Builder webClientBuilder() {
        System.setProperty("reactor.netty.tcp.sslHandshakeTimeout", "30000");

        final int size = (int) DataSize.ofMegabytes(16).toBytes();
        ConnectionProvider connectionProvider = ConnectionProvider.builder("vacancy-aggregation")
                .maxConnections(20)
                .pendingAcquireMaxCount(100)
                .pendingAcquireTimeout(Duration.ofSeconds(30))
                .build();

        HttpClient httpClient = HttpClient.create(connectionProvider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 15000)
                .responseTimeout(Duration.ofSeconds(45));

        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(size))
                .build();

        return WebClient.builder()
                .defaultHeader("User-Agent", "VacancyPlatform/1.0 (integration@platform.com)")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .exchangeStrategies(strategies);
    }

    @Bean("hhWebClient")
    @Primary
    public WebClient hhWebClient(WebClient.Builder webClientBuilder) {
        return webClientBuilder
                .clone()
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + hhApiKey)
                .baseUrl("https://api.hh.ru")
                .build();
    }

    @Bean("superJobWebClient")
    public WebClient superJobWebClient(WebClient.Builder webClientBuilder) {
        return webClientBuilder
                .clone()
                .baseUrl("https://api.superjob.ru/2.0")
                .build();
    }

    @Bean
    public WebClient webClient(WebClient hhWebClient) {
        return hhWebClient;
    }
}
