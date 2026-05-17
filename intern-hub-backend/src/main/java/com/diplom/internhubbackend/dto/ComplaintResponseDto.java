package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ComplaintReason;
import com.diplom.internhubbackend.enums.ComplaintStatus;
import com.diplom.internhubbackend.enums.ComplaintTargetType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ComplaintResponseDto {
    private Long id;
    private ComplaintTargetType targetType;
    private String targetId;
    private ComplaintReason reason;
    private String description;
    private ComplaintStatus status;
    private LocalDateTime createdAt;
}
