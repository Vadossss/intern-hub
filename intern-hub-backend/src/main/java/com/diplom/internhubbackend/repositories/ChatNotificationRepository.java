package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.ChatNotification;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ChatNotificationRepository extends JpaRepository<ChatNotification, String> {
}
