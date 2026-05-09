package com.diplom.internhubbackend.dto.sj;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SjClientDetailsResponse(
        Long id,
        String title,
        String link,
        String description,
        @JsonProperty("client_logo") String clientLogo,
        @JsonProperty("is_blocked") Boolean blocked
) {
}
