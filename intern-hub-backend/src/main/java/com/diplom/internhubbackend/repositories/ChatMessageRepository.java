package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;



public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, String> {

    long countBySenderIdAndRecipientIdAndStatus(
            String senderId, String recipientId, ChatMessage.MessageStatus status);

    long countByChatIdAndRecipientIdAndStatusNot(
            String chatId, String recipientId, ChatMessage.MessageStatus status);

    List<ChatMessage> findByChatId(String chatId);

    List<ChatMessage> findByChatIdAndRecipientIdAndStatusNotOrderByTimestampAsc(
            String chatId, String recipientId, ChatMessage.MessageStatus status);

    List<ChatMessage> findByChatIdOrderByTimestampAsc(String chatId);

    Optional<ChatMessage> findFirstByChatIdOrderByTimestampDesc(String chatId);
}

