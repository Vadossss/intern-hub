package com.diplom.internhubbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogArticleUpsertDto {
    private String title;
    private String summary;
    private String content;
    private String coverImageUrl;
    private Boolean published;
}
