package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.ChatMessageRequestDto;
import com.diplom.internhubbackend.dto.ChatMessageResponseDto;
import com.diplom.internhubbackend.dto.ChatRoomResponseDto;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chats")
public class ChatApiController {
    private final ChatService chatService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<ChatRoomResponseDto> getChats(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return chatService.getChats(userDetails.getUser());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{chat_id}/messages")
    public List<ChatMessageResponseDto> getMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(name = "chat_id") String chatId
    ) {
        return chatService.getMessages(userDetails.getUser(), chatId);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{chat_id}/messages")
    public ChatMessageResponseDto sendMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(name = "chat_id") String chatId,
            @RequestBody ChatMessageRequestDto request
    ) {
        return chatService.sendMessage(
                userDetails.getUser(),
                new ChatMessageRequestDto(chatId, request == null ? null : request.content())
        );
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{chat_id}/read")
    public List<ChatMessageResponseDto> markRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(name = "chat_id") String chatId
    ) {
        return chatService.markRead(userDetails.getUser(), chatId);
    }
}
