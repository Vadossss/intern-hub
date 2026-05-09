package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.BlogArticleResponseDto;
import com.diplom.internhubbackend.dto.BlogArticleUpsertDto;
import com.diplom.internhubbackend.models.BlogArticle;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.repositories.BlogArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BlogArticleService {
    private final BlogArticleRepository blogArticleRepository;

    @Transactional(readOnly = true)
    public Page<BlogArticleResponseDto> getPublishedArticles(String query, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        return blogArticleRepository.searchArticles(
                        normalizeSearchQuery(query),
                        true,
                        PageRequest.of(safePage, safeSize)
                )
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public BlogArticleResponseDto getPublishedArticle(Long articleId) {
        BlogArticle article = blogArticleRepository.findById(articleId)
                .filter(item -> Boolean.TRUE.equals(item.getPublished()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));

        return toDto(article);
    }

    @Transactional
    public BlogArticleResponseDto createArticle(User author, BlogArticleUpsertDto request) {
        validateRequest(request);

        BlogArticle article = BlogArticle.builder()
                .title(request.getTitle().trim())
                .summary(trimOrNull(request.getSummary()))
                .content(request.getContent().trim())
                .coverImageUrl(trimOrNull(request.getCoverImageUrl()))
                .published(request.getPublished() == null || request.getPublished())
                .author(author)
                .build();

        return toDto(blogArticleRepository.save(article));
    }

    @Transactional
    public BlogArticleResponseDto updateArticle(Long articleId, BlogArticleUpsertDto request) {
        validateRequest(request);

        BlogArticle article = blogArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));

        article.setTitle(request.getTitle().trim());
        article.setSummary(trimOrNull(request.getSummary()));
        article.setContent(request.getContent().trim());
        article.setCoverImageUrl(trimOrNull(request.getCoverImageUrl()));
        article.setPublished(request.getPublished() == null || request.getPublished());

        return toDto(blogArticleRepository.save(article));
    }

    @Transactional
    public void deleteArticle(Long articleId) {
        BlogArticle article = blogArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));

        blogArticleRepository.delete(article);
    }

    private BlogArticleResponseDto toDto(BlogArticle article) {
        User author = article.getAuthor();
        String authorName = firstNonBlank(
                joinName(author.getFirstName(), author.getLastName()),
                author.getEmail()
        );

        return BlogArticleResponseDto.builder()
                .id(article.getId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .content(article.getContent())
                .coverImageUrl(article.getCoverImageUrl())
                .authorId(author.getId())
                .authorName(authorName)
                .published(article.getPublished())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    private void validateRequest(BlogArticleUpsertDto request) {
        if (request == null || isBlank(request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Название статьи обязательно");
        }

        if (isBlank(request.getContent())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Текст статьи обязателен");
        }
    }

    private String normalizeSearchQuery(String query) {
        if (isBlank(query)) {
            return null;
        }

        return "%" + query.trim().toLowerCase() + "%";
    }

    private String trimOrNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private String joinName(String firstName, String lastName) {
        String joined = (firstNonBlank(firstName, "") + " " + firstNonBlank(lastName, "")).trim();
        return joined.isBlank() ? null : joined;
    }

    private String firstNonBlank(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
