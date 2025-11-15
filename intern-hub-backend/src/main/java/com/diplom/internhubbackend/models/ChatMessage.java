package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "chat_message")
public class ChatMessage {
    @Id
    private String id;
    private String chatId;
    private String senderId;
    private String recipientId;
    private String senderName;
    private String recipientName;
    private String content;
    private Date timestamp;
    private MessageStatus status;

    public enum MessageStatus {
        RECEIVED, DELIVERED
    }

}
