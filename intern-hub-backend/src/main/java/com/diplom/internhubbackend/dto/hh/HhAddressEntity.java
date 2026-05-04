package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HhAddressEntity(
        String city,
        String street,
        String building,
        String description,
        Float lat,
        Float lng,
        String raw
) {
}
