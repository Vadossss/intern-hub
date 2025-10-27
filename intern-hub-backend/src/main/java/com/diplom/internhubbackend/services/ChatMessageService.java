package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.ChatMessage;
import com.diplom.internhubbackend.repositories.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    // Сохранение нового сообщения
    public ChatMessage saveMessage(ChatMessage message) {
        message.setStatus(ChatMessage.MessageStatus.DELIVERED); // при отправке
        return chatMessageRepository.save(message);
    }

    // Получить все сообщения в чате
    public List<ChatMessage> getMessagesByChatId(String chatId) {
        return chatMessageRepository.findByChatId(chatId);
    }

    // Подсчет непрочитанных сообщений
    public long countUnreadMessages(String senderId, String recepientId) {
        return chatMessageRepository.countBySenderIdAndRecipientIdAndStatus(
                senderId, recepientId, ChatMessage.MessageStatus.RECEIVED);
    }

    // Обновление статуса сообщения
    public void markMessageAsRead(Long messageId) {
        chatMessageRepository.findById(messageId).ifPresent(message -> {
            message.setStatus(ChatMessage.MessageStatus.RECEIVED);
            chatMessageRepository.save(message);
        });
    }
}
