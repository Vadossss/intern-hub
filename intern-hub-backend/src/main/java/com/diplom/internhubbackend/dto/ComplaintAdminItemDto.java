package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ComplaintReason;
import com.diplom.internhubbackend.enums.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ComplaintAdminItemDto {
    private Long id;
    private ComplaintReason reason;
    private String description;
    private ComplaintStatus status;
    private Integer reporterId;
    private String reporterEmail;
    private Integer moderatorId;
    private String moderatorEmail;
    private String moderationComment;
    private LocalDateTime moderatedAt;
    private LocalDateTime createdAt;
}
