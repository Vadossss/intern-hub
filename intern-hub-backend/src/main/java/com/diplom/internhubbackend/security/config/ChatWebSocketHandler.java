package com.diplom.internhubbackend.security.config;

import com.diplom.internhubbackend.dto.ChatMessageRequestDto;
import com.diplom.internhubbackend.dto.ChatMessageResponseDto;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.services.ChatRealtimeNotifier;
import com.diplom.internhubbackend.services.ChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final ChatService chatService;
    private final ChatRealtimeNotifier chatRealtimeNotifier;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        User user = currentUser(session);

        if (user == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Authentication required"));
            return;
        }

        chatRealtimeNotifier.register(user.getId(), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        User user = currentUser(session);

        if (user == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Authentication required"));
            return;
        }

        JsonNode payloadNode = objectMapper.readTree(message.getPayload());

        if ("READ".equals(payloadNode.path("type").asText())) {
            String chatId = payloadNode.path("chatId").asText(null);
            List<ChatMessageResponseDto> readMessages = chatService.markRead(user, chatId);
            if (!readMessages.isEmpty()) {
                chatRealtimeNotifier.sendReadReceipt(user, readMessages);
            }
            return;
        }

        ChatMessageRequestDto request = objectMapper.treeToValue(payloadNode, ChatMessageRequestDto.class);
        chatService.sendMessage(user, request);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        User user = currentUser(session);

        if (user == null) {
            return;
        }

        chatRealtimeNotifier.unregister(user.getId(), session);
    }

    private User currentUser(WebSocketSession session) {
        Object user = session.getAttributes().get(ChatHandshakeInterceptor.USER_ATTRIBUTE);

        return user instanceof User currentUser ? currentUser : null;
    }
}
