package com.diplom.internhubbackend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "chat_room", indexes = {
        @Index(name = "idx_chat_room_chat_id", columnList = "chat_id"),
        @Index(name = "idx_chat_room_candidate_id", columnList = "candidate_id"),
        @Index(name = "idx_chat_room_employer_id", columnList = "employer_id")
})
public class ChatRoom {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "chat_id", nullable = false, length = 36)
    private String chatId;

    @Column(name = "sender_id")
    private String senderId;

    @Column(name = "recipient_id")
    private String recipientId;

    @Column(name = "candidate_id")
    private Integer candidateId;

    @Column(name = "employer_id")
    private Integer employerId;

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "employer_name")
    private String employerName;

    @Column(name = "candidate_avatar_url")
    private String candidateAvatarUrl;

    @Column(name = "employer_avatar_url")
    private String employerAvatarUrl;

    @Column(name = "vacancy_public_id")
    private String vacancyPublicId;

    @Column(name = "vacancy_title")
    private String vacancyTitle;

    @Column(name = "resume_id")
    private Long resumeId;

    @Column(name = "resume_profession")
    private String resumeProfession;

    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "last_message", columnDefinition = "TEXT")
    private String lastMessage;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (chatId == null) {
            chatId = id;
        }
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
