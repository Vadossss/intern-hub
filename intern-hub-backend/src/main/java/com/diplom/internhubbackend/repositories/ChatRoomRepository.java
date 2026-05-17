package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    Optional<ChatRoom> findBySenderIdAndRecipientId(String senderId, String recipientId);

    Optional<ChatRoom> findFirstByChatId(String chatId);

    List<ChatRoom> findAllByCandidateIdOrEmployerId(Integer candidateId, Integer employerId);

    Optional<ChatRoom> findFirstByApplicationId(Long applicationId);

    Optional<ChatRoom> findFirstByEmployerIdAndCandidateIdAndVacancyPublicIdAndResumeId(
            Integer employerId,
            Integer candidateId,
            String vacancyPublicId,
            Long resumeId
    );
}
