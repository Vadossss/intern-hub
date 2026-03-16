package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record HhItemVacancy(
        String id,
        String name,
        @JsonProperty("alternate_url") String alternativeUrl,
        HhSalary salary,
        HhEmployerEntity employer,
        HhAddressEntity address,
        HhNamedEntity experience,
        HhNamedEntity employment,
        HhNamedEntity schedule,
        @JsonProperty("work_format") List<HhNamedEntity> workFormat,
        String internship,
        @JsonProperty("published_at") String publishedAt,
        @JsonProperty("created_at") String createdAt
) {}
