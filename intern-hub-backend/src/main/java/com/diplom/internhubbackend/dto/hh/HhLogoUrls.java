package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HhLogoUrls(
        String original,
        @JsonProperty("90") String small,
        @JsonProperty("240") String big
) {
}
