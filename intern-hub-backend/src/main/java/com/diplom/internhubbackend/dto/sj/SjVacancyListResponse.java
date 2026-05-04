package com.diplom.internhubbackend.dto.sj;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record SjVacancyListResponse(
        @JsonProperty("objects") List<SjVacancyItem> objects,
        @JsonProperty("total") Integer total,
        @JsonProperty("more") Boolean more
) {
}
