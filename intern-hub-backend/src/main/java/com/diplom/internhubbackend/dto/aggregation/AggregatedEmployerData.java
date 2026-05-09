package com.diplom.internhubbackend.dto.aggregation;

public record AggregatedEmployerData(
        String sourceCode,
        String externalId,
        String companyName,
        String description,
        String avatarUrl,
        String website,
        String sourceUrl,
        String city,
        Boolean verified,
        Boolean accredited
) {
}
