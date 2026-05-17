package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.BlogArticleResponseDto;
import com.diplom.internhubbackend.dto.BlogArticleUpsertDto;
import com.diplom.internhubbackend.dto.FileUploadResponseDto;
import com.diplom.internhubbackend.dto.PageResponse;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.BlogArticleService;
import com.diplom.internhubbackend.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/blog/articles")
public class BlogArticleController {
    private final BlogArticleService blogArticleService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public PageResponse<BlogArticleResponseDto> getArticles(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Page<BlogArticleResponseDto> result = blogArticleService.getPublishedArticles(query, page, size);

        return PageResponse.of(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }

    @GetMapping("/{article_id}")
    public BlogArticleResponseDto getArticle(@PathVariable(name = "article_id") Long articleId) {
        return blogArticleService.getPublishedArticle(articleId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public BlogArticleResponseDto createArticle(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody BlogArticleUpsertDto request
    ) {
        return blogArticleService.createArticle(customUserDetails.getUser(), request);
    }

    @PutMapping("/{article_id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public BlogArticleResponseDto updateArticle(
            @PathVariable(name = "article_id") Long articleId,
            @RequestBody BlogArticleUpsertDto request
    ) {
        return blogArticleService.updateArticle(articleId, request);
    }

    @DeleteMapping("/{article_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void deleteArticle(@PathVariable(name = "article_id") Long articleId) {
        blogArticleService.deleteArticle(articleId);
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public FileUploadResponseDto uploadArticleImage(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam("file") MultipartFile file
    ) {
        String url = fileStorageService.saveBlogImage(customUserDetails.getUser().getId(), file);
        return new FileUploadResponseDto(url);
    }
}
