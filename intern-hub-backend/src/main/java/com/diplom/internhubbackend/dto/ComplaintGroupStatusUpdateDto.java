package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ComplaintStatus;
import com.diplom.internhubbackend.enums.ComplaintTargetType;

public record ComplaintGroupStatusUpdateDto(
        ComplaintTargetType targetType,
        String targetId,
        ComplaintStatus status,
        String moderationComment
) {
}
