package com.diplom.internhubbackend.services;


import com.diplom.internhubbackend.models.ChatRoom;
import com.diplom.internhubbackend.repositories.ChatRoomRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomService(ChatRoomRepository chatRoomRepository) {
        this.chatRoomRepository = chatRoomRepository;
    }

    // Создание новой комнаты (если не существует)
    public ChatRoom createOrGetChatRoom(String senderId, String recipientId) {
        Optional<ChatRoom> existingRoom = chatRoomRepository.findBySenderIdAndRecipientId(senderId, recipientId);
        return existingRoom.orElseGet(() -> {
            ChatRoom room = new ChatRoom();
            room.setSenderId(senderId);
            room.setRecipientId(recipientId);
            return chatRoomRepository.save(room);
        });
    }

    // Получить комнату по ID
    public Optional<ChatRoom> getChatRoomById(Long id ) {
        return chatRoomRepository.findById(id );
    }




}
