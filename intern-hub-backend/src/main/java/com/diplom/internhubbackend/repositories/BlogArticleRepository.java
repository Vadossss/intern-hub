package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.BlogArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlogArticleRepository extends JpaRepository<BlogArticle, Long> {
    @Query("""
            SELECT article FROM BlogArticle article
            WHERE (:published IS NULL OR article.published = :published)
              AND (
                :query IS NULL
                OR LOWER(article.title) LIKE :query
                OR LOWER(COALESCE(article.summary, '')) LIKE :query
                OR LOWER(article.content) LIKE :query
              )
            ORDER BY COALESCE(article.updatedAt, article.createdAt) DESC
            """)
    Page<BlogArticle> searchArticles(
            @Param("query") String query,
            @Param("published") Boolean published,
            Pageable pageable
    );
}
