package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ComplaintTargetType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ComplaintGroupResponseDto {
    private ComplaintTargetType targetType;
    private String targetId;
    private String targetTitle;
    private String targetSubtitle;
    private String targetHref;
    private Integer ownerId;
    private String ownerName;
    private String ownerStatus;
    private Boolean ownerBlocked;
    private Long totalCount;
    private Long newCount;
    private LocalDateTime lastCreatedAt;
    private List<ComplaintReasonCountDto> reasonCounts;
    private List<ComplaintAdminItemDto> complaints;
}
