package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.ChatMessageResponseDto;
import com.diplom.internhubbackend.models.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatRealtimeNotifier {
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<Integer, Set<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();

    public void register(Integer userId, WebSocketSession session) {
        if (userId == null || session == null) {
            return;
        }

        sessionsByUserId
                .computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet())
                .add(session);
    }

    public void unregister(Integer userId, WebSocketSession session) {
        if (userId == null || session == null) {
            return;
        }

        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null) {
            return;
        }

        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUserId.remove(userId);
        }
    }

    public void sendMessage(ChatMessageResponseDto message) {
        if (message == null) {
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(message);
            sendToUser(parseUserId(message.senderId()), payload);
            sendToUser(parseUserId(message.recipientId()), payload);
        } catch (JsonProcessingException exception) {
            log.warn("Failed to serialize chat message notification", exception);
        }
    }

    public void sendReadReceipt(User reader, List<ChatMessageResponseDto> messages) {
        if (reader == null || messages == null || messages.isEmpty()) {
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(readReceiptPayload(reader, messages));
            sendToUser(reader.getId(), payload);
            messages.stream()
                    .map(ChatMessageResponseDto::senderId)
                    .map(this::parseUserId)
                    .distinct()
                    .forEach(senderId -> sendToUser(senderId, payload));
        } catch (JsonProcessingException exception) {
            log.warn("Failed to serialize chat read receipt", exception);
        }
    }

    private ObjectNode readReceiptPayload(User reader, List<ChatMessageResponseDto> messages) {
        ObjectNode payload = objectMapper.createObjectNode();
        ArrayNode messageIds = payload.putArray("messageIds");

        messages.stream()
                .map(ChatMessageResponseDto::id)
                .forEach(messageIds::add);

        payload.put("type", "READ_RECEIPT");
        payload.put("chatId", messages.get(0).chatId());
        payload.put("readerId", String.valueOf(reader.getId()));

        return payload;
    }

    private Integer parseUserId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException exception) {
            log.warn("Invalid chat participant id: {}", value);
            return null;
        }
    }

    private void sendToUser(Integer userId, String payload) {
        if (userId == null || payload == null) {
            return;
        }

        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        sessions.removeIf(session -> !session.isOpen());
        sessions.forEach(session -> send(session, payload));
    }

    private void send(WebSocketSession session, String payload) {
        try {
            synchronized (session) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(payload));
                }
            }
        } catch (IOException exception) {
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (IOException closeException) {
                log.debug("Failed to close broken chat websocket session", closeException);
            }
        }
    }
}
