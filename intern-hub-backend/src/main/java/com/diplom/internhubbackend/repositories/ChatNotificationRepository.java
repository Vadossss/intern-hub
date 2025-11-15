package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.ChatNotification;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface ChatNotificationRepository extends MongoRepository<ChatNotification, String> {
}
