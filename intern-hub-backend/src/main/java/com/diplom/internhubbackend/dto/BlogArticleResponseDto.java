package com.diplom.internhubbackend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BlogArticleResponseDto {
    private Long id;
    private String title;
    private String summary;
    private String content;
    private String coverImageUrl;
    private Integer authorId;
    private String authorName;
    private Boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
