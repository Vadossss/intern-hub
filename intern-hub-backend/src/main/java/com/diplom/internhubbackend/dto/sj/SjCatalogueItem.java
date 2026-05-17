package com.diplom.internhubbackend.dto.sj;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record SjCatalogueItem(
        @JsonProperty("key") Integer key,
        String title,
        @JsonProperty("title_rus") String titleRus,
        @JsonProperty("id_parent") Integer parentId,
        List<SjCatalogueItem> positions
) {
}
