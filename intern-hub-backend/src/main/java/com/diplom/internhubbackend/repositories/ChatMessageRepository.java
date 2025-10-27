package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long>{
    long countBySenderIdAndRecipientIdAndStatus(
            String senderId, String recepientId, ChatMessage.MessageStatus status);

    List<ChatMessage> findByChatId(String chatId);





}
