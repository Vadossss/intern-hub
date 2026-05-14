package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.ComplaintRequestDto;
import com.diplom.internhubbackend.dto.ComplaintResponseDto;
import com.diplom.internhubbackend.dto.ComplaintAdminItemDto;
import com.diplom.internhubbackend.dto.ComplaintGroupStatusUpdateDto;
import com.diplom.internhubbackend.dto.ComplaintGroupResponseDto;
import com.diplom.internhubbackend.dto.ComplaintReasonCountDto;
import com.diplom.internhubbackend.dto.ComplaintTargetBlockRequestDto;
import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.ComplaintStatus;
import com.diplom.internhubbackend.enums.ComplaintTargetType;
import com.diplom.internhubbackend.models.CandidateProfile;
import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.models.Complaint;
import com.diplom.internhubbackend.models.EmployerProfile;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import com.diplom.internhubbackend.repositories.ComplaintRepository;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private static final int MAX_DESCRIPTION_LENGTH = 2000;

    private final ComplaintRepository complaintRepository;
    private final VacancyRepository vacancyRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CandidateResumeRepository candidateResumeRepository;
    private final UserModerationService userModerationService;

    @Transactional
    public ComplaintResponseDto createComplaint(User reporter, ComplaintRequestDto request) {
        validateRequest(reporter, request);

        Complaint complaint = Complaint.builder()
                .reporter(reporter)
                .targetType(request.targetType())
                .reason(request.reason())
                .description(normalizeDescription(request.description()))
                .status(ComplaintStatus.NEW)
                .build();

        attachTarget(complaint, request.targetId().trim());

        return toDto(complaintRepository.save(complaint));
    }

    @Transactional(readOnly = true)
    public List<ComplaintGroupResponseDto> getGroupedComplaints() {
        Map<String, List<Complaint>> grouped = complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                .collect(Collectors.groupingBy(
                        complaint -> complaint.getTargetType() + ":" + complaint.getTargetId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return grouped.values().stream()
                .map(this::toGroupDto)
                .sorted(Comparator.comparing(ComplaintGroupResponseDto::getLastCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public long countNewComplaints() {
        return complaintRepository.countByStatus(ComplaintStatus.NEW);
    }

    @Transactional
    public List<ComplaintGroupResponseDto> updateGroupStatus(User moderator, ComplaintGroupStatusUpdateDto request) {
        validateGroupStatusRequest(moderator, request);
        List<Complaint> complaints = getTargetComplaints(request.targetType(), request.targetId());

        applyModerationStatus(
                complaints,
                request.status(),
                moderator,
                normalizeDescription(request.moderationComment())
        );

        return getGroupedComplaints();
    }

    @Transactional
    public List<ComplaintGroupResponseDto> blockTargetOwner(User moderator, ComplaintTargetBlockRequestDto request) {
        validateBlockRequest(moderator, request);
        List<Complaint> complaints = getTargetComplaints(request.targetType(), request.targetId());
        User owner = resolveTargetOwner(complaints.getFirst());

        if (owner == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint target owner is not available");
        }

        String blockReason = normalizeBlockReason(request.reason());
        userModerationService.blockUser(owner.getId(), blockReason, request.until());
        applyModerationStatus(
                complaints,
                ComplaintStatus.RESOLVED,
                moderator,
                normalizeDescription(request.moderationComment())
        );

        return getGroupedComplaints();
    }

    private void validateRequest(User reporter, ComplaintRequestDto request) {
        if (reporter == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint payload is required");
        }

        if (request.targetType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint target type is required");
        }

        if (request.reason() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint reason is required");
        }

        if (isBlank(request.targetId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint target id is required");
        }
    }

    private void validateGroupStatusRequest(User moderator, ComplaintGroupStatusUpdateDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint moderation payload is required");
        }

        validateModeratorAndTarget(moderator, request == null ? null : request.targetType(), request == null ? null : request.targetId());

        if (request.status() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint status is required");
        }

        if (!isAdminModerationStatus(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint status cannot be applied by moderator");
        }
    }

    private void validateBlockRequest(User moderator, ComplaintTargetBlockRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint block payload is required");
        }

        validateModeratorAndTarget(moderator, request == null ? null : request.targetType(), request == null ? null : request.targetId());
    }

    private void validateModeratorAndTarget(User moderator, ComplaintTargetType targetType, String targetId) {
        if (moderator == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        if (targetType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint target type is required");
        }

        if (isBlank(targetId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint target id is required");
        }
    }

    private boolean isAdminModerationStatus(ComplaintStatus status) {
        return status == ComplaintStatus.IN_REVIEW
                || status == ComplaintStatus.RESOLVED
                || status == ComplaintStatus.CANCELED;
    }

    private List<Complaint> getTargetComplaints(ComplaintTargetType targetType, String targetId) {
        List<Complaint> complaints = complaintRepository.findAllByTargetTypeAndTargetIdOrderByCreatedAtDesc(
                targetType,
                targetId.trim()
        );

        if (complaints.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint group not found");
        }

        return complaints;
    }

    private void applyModerationStatus(
            List<Complaint> complaints,
            ComplaintStatus status,
            User moderator,
            String moderationComment
    ) {
        LocalDateTime moderatedAt = LocalDateTime.now();

        for (Complaint complaint : complaints) {
            complaint.setStatus(status);
            complaint.setModerator(moderator);
            complaint.setModerationComment(moderationComment);
            complaint.setModeratedAt(moderatedAt);
        }
    }

    private User resolveTargetOwner(Complaint complaint) {
        if (complaint.getTargetType() == ComplaintTargetType.VACANCY) {
            Vacancy vacancy = complaint.getVacancy();
            return vacancy == null ? null : vacancy.getEmployer();
        }

        if (complaint.getTargetType() == ComplaintTargetType.EMPLOYER_PROFILE) {
            EmployerProfile profile = complaint.getEmployerProfile();
            return profile == null ? null : profile.getUser();
        }

        CandidateResume resume = complaint.getCandidateResume();
        CandidateProfile profile = resume == null ? null : resume.getCandidateProfile();
        return profile == null ? null : profile.getUser();
    }

    private void attachTarget(Complaint complaint, String targetId) {
        switch (complaint.getTargetType()) {
            case VACANCY -> attachVacancy(complaint, targetId);
            case EMPLOYER_PROFILE -> attachEmployerProfile(complaint, targetId);
            case CANDIDATE_RESUME -> attachCandidateResume(complaint, targetId);
        }
    }

    private void attachVacancy(Complaint complaint, String targetId) {
        Vacancy vacancy = vacancyRepository.findByPublicId(targetId.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vacancy not found"));

        complaint.setVacancy(vacancy);
        complaint.setTargetId(vacancy.getPublicId());
    }

    private void attachEmployerProfile(Complaint complaint, String targetId) {
        Integer userId = parseIntegerTargetId(targetId, "Employer profile id is invalid");
        EmployerProfile employerProfile = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer profile not found"));

        complaint.setEmployerProfile(employerProfile);
        complaint.setTargetId(String.valueOf(userId));
    }

    private void attachCandidateResume(Complaint complaint, String targetId) {
        Long resumeId = parseLongTargetId(targetId, "Candidate resume id is invalid");
        CandidateResume candidateResume = candidateResumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate resume not found"));

        complaint.setCandidateResume(candidateResume);
        complaint.setTargetId(String.valueOf(resumeId));
    }

    private Integer parseIntegerTargetId(String targetId, String message) {
        try {
            return Integer.valueOf(targetId);
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message, exception);
        }
    }

    private Long parseLongTargetId(String targetId, String message) {
        try {
            return Long.valueOf(targetId);
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message, exception);
        }
    }

    private ComplaintResponseDto toDto(Complaint complaint) {
        return ComplaintResponseDto.builder()
                .id(complaint.getId())
                .targetType(complaint.getTargetType())
                .targetId(complaint.getTargetId())
                .reason(complaint.getReason())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    private ComplaintGroupResponseDto toGroupDto(List<Complaint> complaints) {
        Complaint first = complaints.getFirst();
        TargetDetails targetDetails = getTargetDetails(first);
        List<ComplaintAdminItemDto> complaintItems = complaints.stream()
                .map(this::toAdminItemDto)
                .toList();
        List<ComplaintReasonCountDto> reasonCounts = complaints.stream()
                .collect(Collectors.groupingBy(
                        Complaint::getReason,
                        LinkedHashMap::new,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .map(entry -> ComplaintReasonCountDto.builder()
                        .reason(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .toList();

        return ComplaintGroupResponseDto.builder()
                .targetType(first.getTargetType())
                .targetId(first.getTargetId())
                .targetTitle(targetDetails.title())
                .targetSubtitle(targetDetails.subtitle())
                .targetHref(targetDetails.href())
                .ownerId(targetDetails.ownerId())
                .ownerName(targetDetails.ownerName())
                .ownerStatus(targetDetails.ownerStatus())
                .ownerBlocked(AccountStatus.BLOCKED.name().equals(targetDetails.ownerStatus()))
                .totalCount((long) complaints.size())
                .newCount(complaints.stream()
                        .filter(complaint -> complaint.getStatus() == ComplaintStatus.NEW)
                        .count())
                .lastCreatedAt(complaints.stream()
                        .map(Complaint::getCreatedAt)
                        .filter(Objects::nonNull)
                        .max(LocalDateTime::compareTo)
                        .orElse(null))
                .reasonCounts(reasonCounts)
                .complaints(complaintItems)
                .build();
    }

    private ComplaintAdminItemDto toAdminItemDto(Complaint complaint) {
        User reporter = complaint.getReporter();
        User moderator = complaint.getModerator();

        return ComplaintAdminItemDto.builder()
                .id(complaint.getId())
                .reason(complaint.getReason())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .reporterId(reporter == null ? null : reporter.getId())
                .reporterEmail(reporter == null ? null : reporter.getEmail())
                .moderatorId(moderator == null ? null : moderator.getId())
                .moderatorEmail(moderator == null ? null : moderator.getEmail())
                .moderationComment(complaint.getModerationComment())
                .moderatedAt(complaint.getModeratedAt())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    private TargetDetails getTargetDetails(Complaint complaint) {
        if (complaint.getTargetType() == ComplaintTargetType.VACANCY) {
            return getVacancyTargetDetails(complaint);
        }

        if (complaint.getTargetType() == ComplaintTargetType.EMPLOYER_PROFILE) {
            return getEmployerTargetDetails(complaint);
        }

        return getResumeTargetDetails(complaint);
    }

    private TargetDetails getVacancyTargetDetails(Complaint complaint) {
        Vacancy vacancy = complaint.getVacancy();
        User employer = vacancy == null ? null : vacancy.getEmployer();

        return new TargetDetails(
                vacancy == null ? "Вакансия удалена" : valueOrFallback(vacancy.getTitle(), "Вакансия без названия"),
                vacancy == null ? complaint.getTargetId() : valueOrFallback(vacancy.getCity(), "Город не указан"),
                vacancy == null ? null : "/vacancies/" + vacancy.getPublicId(),
                employer == null ? null : employer.getId(),
                employer == null ? null : employer.getEmail(),
                getUserStatus(employer)
        );
    }

    private TargetDetails getEmployerTargetDetails(Complaint complaint) {
        EmployerProfile profile = complaint.getEmployerProfile();
        User employer = profile == null ? null : profile.getUser();
        String companyName = profile == null ? null : profile.getCompanyName();

        return new TargetDetails(
                valueOrFallback(companyName, "Профиль работодателя"),
                profile == null ? complaint.getTargetId() : valueOrFallback(profile.getCity(), employer == null ? null : employer.getEmail()),
                employer == null ? null : "/employers/" + employer.getId(),
                employer == null ? null : employer.getId(),
                valueOrFallback(companyName, employer == null ? null : employer.getEmail()),
                getUserStatus(employer)
        );
    }

    private TargetDetails getResumeTargetDetails(Complaint complaint) {
        CandidateResume resume = complaint.getCandidateResume();
        CandidateProfile profile = resume == null ? null : resume.getCandidateProfile();
        User candidate = profile == null ? null : profile.getUser();
        String candidateName = getCandidateName(profile, candidate);

        return new TargetDetails(
                resume == null ? "Резюме удалено" : valueOrFallback(resume.getProfession(), "Резюме без названия"),
                candidateName,
                candidate == null ? null : "/candidate/" + candidate.getId(),
                candidate == null ? null : candidate.getId(),
                candidateName,
                getUserStatus(candidate)
        );
    }

    private String getUserStatus(User user) {
        return user == null || user.getStatus() == null ? null : user.getStatus().name();
    }

    private String getCandidateName(CandidateProfile profile, User candidate) {
        if (profile != null) {
            List<String> parts = new ArrayList<>();
            if (!isBlank(profile.getFirstName())) {
                parts.add(profile.getFirstName().trim());
            }
            if (!isBlank(profile.getLastName())) {
                parts.add(profile.getLastName().trim());
            }
            if (!parts.isEmpty()) {
                return String.join(" ", parts);
            }
        }

        return candidate == null ? "Соискатель" : candidate.getEmail();
    }

    private String valueOrFallback(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private String normalizeDescription(String description) {
        if (isBlank(description)) {
            return null;
        }

        String trimmed = description.trim();
        return trimmed.length() <= MAX_DESCRIPTION_LENGTH
                ? trimmed
                : trimmed.substring(0, MAX_DESCRIPTION_LENGTH);
    }

    private String normalizeBlockReason(String reason) {
        if (!isBlank(reason)) {
            return normalizeDescription(reason);
        }

        return "Confirmed complaints from users";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record TargetDetails(
            String title,
            String subtitle,
            String href,
            Integer ownerId,
            String ownerName,
            String ownerStatus
    ) {
    }
}
