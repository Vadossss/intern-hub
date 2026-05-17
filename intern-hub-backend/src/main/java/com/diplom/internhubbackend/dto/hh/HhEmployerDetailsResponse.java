package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HhEmployerDetailsResponse(
        String id,
        String name,
        String description,
        @JsonProperty("site_url") String siteUrl,
        @JsonProperty("alternate_url") String alternateUrl,
        @JsonProperty("logo_urls") HhLogoUrls logoUrls,
        HhNamedEntity area,
        @JsonProperty("accredited_it_employer") Boolean accreditedItEmployer,
        Boolean trusted
) {
}
