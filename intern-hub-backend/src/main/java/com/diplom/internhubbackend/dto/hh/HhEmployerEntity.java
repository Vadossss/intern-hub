package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HhEmployerEntity(
        String id,
        String name,
        String url,
        @JsonProperty("alternate_url") String alternateUrl,
        @JsonProperty("logo_urls") HhLogoUrls logoUrls,
        @JsonProperty("country_id") Integer country_id,
        @JsonProperty("accredited_it_employer") Boolean accreditedItEmployer,
        Boolean trusted
) {
}
