package com.diplom.internhubbackend.dto;

public record ChatMessageRequestDto(
        String chatId,
        String content
) {
}
