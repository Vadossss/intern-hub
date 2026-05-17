package com.diplom.internhubbackend.dto;

import java.time.LocalDateTime;

public record ChatRoomResponseDto(
        String chatId,
        Integer candidateId,
        Integer employerId,
        String candidateName,
        String employerName,
        String candidateAvatarUrl,
        String employerAvatarUrl,
        String vacancyPublicId,
        String vacancyTitle,
        Long resumeId,
        String resumeProfession,
        Long applicationId,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
