package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.enums.ComplaintStatus;
import com.diplom.internhubbackend.enums.ComplaintTargetType;
import com.diplom.internhubbackend.models.Complaint;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    @EntityGraph(attributePaths = {
            "reporter",
            "reporter.role",
            "vacancy",
            "vacancy.employer",
            "employerProfile",
            "employerProfile.user",
            "candidateResume",
            "candidateResume.candidateProfile",
            "candidateResume.candidateProfile.user",
            "moderator"
    })
    List<Complaint> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {
            "reporter",
            "vacancy",
            "vacancy.employer",
            "employerProfile",
            "employerProfile.user",
            "candidateResume",
            "candidateResume.candidateProfile",
            "candidateResume.candidateProfile.user",
            "moderator"
    })
    List<Complaint> findAllByTargetTypeAndTargetIdOrderByCreatedAtDesc(
            ComplaintTargetType targetType,
            String targetId
    );

    long countByStatus(ComplaintStatus status);
}
