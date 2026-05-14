package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ComplaintReason;
import com.diplom.internhubbackend.enums.ComplaintTargetType;

public record ComplaintRequestDto(
        ComplaintTargetType targetType,
        String targetId,
        ComplaintReason reason,
        String description
) {
}
