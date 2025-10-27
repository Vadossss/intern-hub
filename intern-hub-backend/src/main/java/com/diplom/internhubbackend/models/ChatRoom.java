package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "chat_rooms")

public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private int id;
    private String chatID;
    @Getter
    @Setter
    private String senderId;
    @Getter
    @Setter
    private String recipientId;

}
