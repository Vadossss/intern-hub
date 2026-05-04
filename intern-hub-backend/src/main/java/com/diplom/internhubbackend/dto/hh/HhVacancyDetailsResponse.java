package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record HhVacancyDetailsResponse(
        String id,
        String description,
        @JsonProperty("key_skills") List<HhKeySkill> keySkills
) {
}
