package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ComplaintTargetType;

import java.time.LocalDateTime;

public record ComplaintTargetBlockRequestDto(
        ComplaintTargetType targetType,
        String targetId,
        String reason,
        LocalDateTime until,
        String moderationComment
) {
}
