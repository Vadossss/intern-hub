package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.CandidateResumeResponseDto;
import com.diplom.internhubbackend.dto.CandidateResumeViewStatsDto;
import com.diplom.internhubbackend.dto.VacancyResponseDto;
import com.diplom.internhubbackend.dto.projection.VacancyProjection;
import com.diplom.internhubbackend.models.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ViewTrackingService {
    private final JdbcTemplate jdbcTemplate;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordVacancyView(VacancyProjection vacancy, User viewer, HttpServletRequest request) {
        if (vacancy == null || vacancy.id() == null || shouldSkip(vacancy.employerId(), viewer)) {
            return;
        }

        if (viewer != null && viewer.getId() != null) {
            jdbcTemplate.update(
                    """
                            INSERT INTO vacancy_view (vacancy_id, viewer_id, viewed_at, updated_at)
                            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                            ON CONFLICT (vacancy_id, viewer_id) WHERE viewer_id IS NOT NULL
                            DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                            """,
                    vacancy.id(),
                    viewer.getId()
            );
            return;
        }

        jdbcTemplate.update(
                """
                        INSERT INTO vacancy_view (vacancy_id, visitor_key, viewed_at, updated_at)
                        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        ON CONFLICT (vacancy_id, visitor_key) WHERE viewer_id IS NULL AND visitor_key IS NOT NULL
                        DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                        """,
                vacancy.id(),
                visitorKey("vacancy", vacancy.id(), request)
        );
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordResumeView(
            Long resumeId,
            Integer ownerUserId,
            Boolean archived,
            User viewer,
            HttpServletRequest request
    ) {
        if (resumeId == null || Boolean.TRUE.equals(archived) || shouldSkip(ownerUserId, viewer)) {
            return;
        }

        if (viewer != null && viewer.getId() != null) {
            jdbcTemplate.update(
                    """
                            INSERT INTO candidate_resume_view (resume_id, viewer_id, viewed_at, updated_at)
                            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                            ON CONFLICT (resume_id, viewer_id) WHERE viewer_id IS NOT NULL
                            DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                            """,
                    resumeId,
                    viewer.getId()
            );
            return;
        }

        jdbcTemplate.update(
                """
                        INSERT INTO candidate_resume_view (resume_id, visitor_key, viewed_at, updated_at)
                        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        ON CONFLICT (resume_id, visitor_key) WHERE viewer_id IS NULL AND visitor_key IS NOT NULL
                        DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                        """,
                resumeId,
                visitorKey("resume", resumeId, request)
        );
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordResumeViews(
            List<CandidateResumeResponseDto> resumes,
            Integer ownerUserId,
            User viewer,
            HttpServletRequest request
    ) {
        if (resumes == null || resumes.isEmpty() || shouldSkip(ownerUserId, viewer)) {
            return;
        }

        for (CandidateResumeResponseDto resume : resumes) {
            recordResumeView(
                    resume == null ? null : resume.getId(),
                    ownerUserId,
                    resume == null ? null : resume.getArchived(),
                    viewer,
                    request
            );
        }
    }

    @Transactional(readOnly = true)
    public long countVacancyViews(Integer vacancyId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM vacancy_view WHERE vacancy_id = ?",
                Long.class,
                vacancyId
        );

        return count == null ? 0L : count;
    }

    @Transactional(readOnly = true)
    public long countVacancyViewsToday(Integer vacancyId) {
        Long count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(*)
                        FROM vacancy_view
                        WHERE vacancy_id = ?
                          AND updated_at >= CURRENT_DATE
                          AND updated_at < CURRENT_DATE + INTERVAL '1 day'
                        """,
                Long.class,
                vacancyId
        );

        return count == null ? 0L : count;
    }

    @Transactional(readOnly = true)
    public Map<Integer, Long> countVacancyViewsByIds(Collection<Integer> vacancyIds) {
        if (vacancyIds == null || vacancyIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String sql = """
                SELECT vacancy_id, COUNT(*) AS view_count
                FROM vacancy_view
                WHERE vacancy_id = ANY (?)
                GROUP BY vacancy_id
                """;

        return jdbcTemplate.query(
                sql,
                ps -> ps.setArray(1, ps.getConnection().createArrayOf("INTEGER", vacancyIds.toArray())),
                rs -> {
                    Map<Integer, Long> counts = new LinkedHashMap<>();
                    while (rs.next()) {
                        counts.put(rs.getInt("vacancy_id"), rs.getLong("view_count"));
                    }
                    return counts;
                }
        );
    }

    @Transactional(readOnly = true)
    public Map<Long, Long> countResumeViewsByIds(Collection<Long> resumeIds) {
        if (resumeIds == null || resumeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String sql = """
                SELECT resume_id, COUNT(*) AS view_count
                FROM candidate_resume_view
                WHERE resume_id = ANY (?)
                GROUP BY resume_id
                """;

        return jdbcTemplate.query(
                sql,
                ps -> ps.setArray(1, ps.getConnection().createArrayOf("BIGINT", resumeIds.toArray())),
                rs -> {
                    Map<Long, Long> counts = new LinkedHashMap<>();
                    while (rs.next()) {
                        counts.put(rs.getLong("resume_id"), rs.getLong("view_count"));
                    }
                    return counts;
                }
        );
    }

    public void applyResumeViewCounts(List<CandidateResumeResponseDto> resumes) {
        if (resumes == null || resumes.isEmpty()) {
            return;
        }

        Map<Long, Long> counts = countResumeViewsByIds(resumes.stream()
                .map(CandidateResumeResponseDto::getId)
                .filter(Objects::nonNull)
                .toList());

        resumes.forEach(resume -> resume.setViewCount(counts.getOrDefault(resume.getId(), 0L)));
    }

    public void applyVacancyViewCounts(List<VacancyResponseDto> vacancies) {
        if (vacancies == null || vacancies.isEmpty()) {
            return;
        }

        Map<Integer, Long> counts = countVacancyViewsByIds(vacancies.stream()
                .map(VacancyResponseDto::getId)
                .filter(Objects::nonNull)
                .toList());

        vacancies.forEach(vacancy -> vacancy.setViewCount(counts.getOrDefault(vacancy.getId(), 0L)));
    }

    @Transactional(readOnly = true)
    public CandidateResumeViewStatsDto getResumeViewStats(Long resumeId, int days) {
        int normalizedDays = Math.max(1, Math.min(days, 90));
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(normalizedDays - 1L);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        Long totalViews = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM candidate_resume_view WHERE resume_id = ?",
                Long.class,
                resumeId
        );

        Map<LocalDate, Long> dailyViews = jdbcTemplate.query(
                """
                        SELECT CAST(updated_at AS DATE) AS view_date, COUNT(*) AS view_count
                        FROM candidate_resume_view
                        WHERE resume_id = ?
                          AND updated_at >= ?
                        GROUP BY CAST(updated_at AS DATE)
                        ORDER BY view_date
                        """,
                ps -> {
                    ps.setLong(1, resumeId);
                    ps.setTimestamp(2, Timestamp.valueOf(startDateTime));
                },
                rs -> {
                    Map<LocalDate, Long> result = new LinkedHashMap<>();
                    while (rs.next()) {
                        result.put(rs.getObject("view_date", LocalDate.class), rs.getLong("view_count"));
                    }
                    return result;
                }
        );

        List<CandidateResumeViewStatsDto.DailyViewDto> chart = startDate
                .datesUntil(endDate.plusDays(1))
                .map(date -> new CandidateResumeViewStatsDto.DailyViewDto(
                        date,
                        dailyViews.getOrDefault(date, 0L)
                ))
                .toList();

        List<CandidateResumeViewStatsDto.CompanyViewDto> companies = jdbcTemplate.query(
                """
                        SELECT u.id AS employer_id,
                               COALESCE(ep.company_name, u.email) AS company_name,
                               COALESCE(ep.avatar_url, u.avatar_url) AS avatar_url,
                               rv.updated_at AS viewed_at
                        FROM candidate_resume_view rv
                        JOIN users u ON rv.viewer_id = u.id
                        LEFT JOIN employer_profile ep ON ep.user_id = u.id
                        WHERE rv.resume_id = ?
                          AND u.role_id = 'ROLE_EMPLOYER'
                        ORDER BY rv.updated_at DESC
                        LIMIT 100
                        """,
                (rs, rowNum) -> new CandidateResumeViewStatsDto.CompanyViewDto(
                        rs.getInt("employer_id"),
                        rs.getString("company_name"),
                        rs.getString("avatar_url"),
                        rs.getTimestamp("viewed_at").toLocalDateTime()
                ),
                resumeId
        );

        return CandidateResumeViewStatsDto.builder()
                .resumeId(resumeId)
                .totalViews(totalViews == null ? 0L : totalViews)
                .days(normalizedDays)
                .chart(chart)
                .companies(companies)
                .build();
    }

    private boolean shouldSkip(Integer ownerUserId, User viewer) {
        if (viewer == null) {
            return false;
        }

        if (Objects.equals(ownerUserId, viewer.getId())) {
            return true;
        }

        String roleId = viewer.getRole() == null ? null : viewer.getRole().getId();
        return "ROLE_ADMIN".equals(roleId);
    }

    private String visitorKey(String scope, Object targetId, HttpServletRequest request) {
        String source = scope + ":" + targetId + ":" + clientIp(request) + ":" + userAgent(request);
        return sha256(source);
    }

    private String clientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    private String userAgent(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String userAgent = request.getHeader("User-Agent");
        return userAgent == null || userAgent.isBlank() ? "unknown" : userAgent;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(hash.length * 2);
            for (byte item : hash) {
                result.append(String.format("%02x", item));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
