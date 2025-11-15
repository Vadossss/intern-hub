package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;


import java.util.List;



public interface ChatMessageRepository
        extends MongoRepository<ChatMessage, String> {

    long countBySenderIdAndRecipientIdAndStatus(
            String senderId, String recipientId, ChatMessage.MessageStatus status);

    List<ChatMessage> findByChatId(String chatId);
}

