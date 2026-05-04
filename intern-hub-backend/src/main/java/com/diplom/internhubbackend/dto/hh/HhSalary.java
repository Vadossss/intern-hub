package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HhSalary(
        Long from,
        Long to,
        String currency
) {
}
