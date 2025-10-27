package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

@Entity
@Table(name="chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter
    @Setter
    private Long id;
    @Getter
    @Setter
    private String chatId;
    @Getter
    @Setter
    private String senderId;
    @Getter
    @Setter
    private String recipientId;
    private String senderName;
    private String recipientName;
    private String message;
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
    @Enumerated(EnumType.STRING)
    private MessageStatus status;


    public enum MessageStatus {
        RECEIVED, DELIVERED
    }

}
