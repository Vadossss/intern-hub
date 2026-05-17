package com.diplom.internhubbackend.dto;

import java.time.LocalDateTime;

public record ChatMessageResponseDto(
        String id,
        String chatId,
        String senderId,
        String recipientId,
        String senderName,
        String recipientName,
        String content,
        LocalDateTime timestamp,
        String status
) {
}
