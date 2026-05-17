package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.ChatMessageRequestDto;
import com.diplom.internhubbackend.dto.ChatMessageResponseDto;
import com.diplom.internhubbackend.dto.ChatRoomResponseDto;
import com.diplom.internhubbackend.dto.EmployerInviteCandidateRequestDto;
import com.diplom.internhubbackend.exception.ResourceNotFoundException;
import com.diplom.internhubbackend.exception.VacancyNotFoundException;
import com.diplom.internhubbackend.enums.VacancyStatus;
import com.diplom.internhubbackend.models.Application;
import com.diplom.internhubbackend.models.CandidateProfile;
import com.diplom.internhubbackend.models.CandidateResume;
import com.diplom.internhubbackend.models.ChatMessage;
import com.diplom.internhubbackend.models.ChatRoom;
import com.diplom.internhubbackend.models.EmployerProfile;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import com.diplom.internhubbackend.repositories.CandidateProfileRepository;
import com.diplom.internhubbackend.repositories.CandidateResumeRepository;
import com.diplom.internhubbackend.repositories.ChatMessageRepository;
import com.diplom.internhubbackend.repositories.ChatRoomRepository;
import com.diplom.internhubbackend.repositories.EmployerProfileRepository;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final CandidateResumeRepository candidateResumeRepository;
    private final VacancyRepository vacancyRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final ChatRealtimeNotifier chatRealtimeNotifier;

    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getChats(User user) {
        return chatRoomRepository.findAllByCandidateIdOrEmployerId(user.getId(), user.getId()).stream()
                .sorted(Comparator.comparing(
                        ChatRoom::getUpdatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(room -> toRoomDto(room, user))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponseDto> getMessages(User user, String chatId) {
        ChatRoom room = getParticipantRoom(user, chatId);

        return chatMessageRepository.findByChatIdOrderByTimestampAsc(room.getChatId()).stream()
                .map(this::toMessageDto)
                .toList();
    }

    @Transactional
    public List<ChatMessageResponseDto> markRead(User user, String chatId) {
        ChatRoom room = getParticipantRoom(user, chatId);

        return markIncomingMessagesAsRead(room, user).stream()
                .map(this::toMessageDto)
                .toList();
    }

    @Transactional
    public ChatRoomResponseDto inviteCandidate(User employer, Long resumeId, EmployerInviteCandidateRequestDto request) {
        if (request == null || request.vacancyPublicId() == null || request.vacancyPublicId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacancy is required");
        }

        if (request.message() == null || request.message().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        CandidateResume resume = candidateResumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (Boolean.TRUE.equals(resume.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume is archived");
        }

        Vacancy vacancy = vacancyRepository
                .findByPublicIdAndEmployerId(request.vacancyPublicId().toLowerCase(), employer.getId())
                .orElseThrow(() -> new VacancyNotFoundException("Vacancy not found"));

        if (vacancy.getStatus() != VacancyStatus.APPROVED && vacancy.getStatus() != VacancyStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacancy is not active");
        }

        User candidate = resume.getCandidateProfile().getUser();
        ChatRoom room = chatRoomRepository
                .findFirstByEmployerIdAndCandidateIdAndVacancyPublicIdAndResumeId(
                        employer.getId(),
                        candidate.getId(),
                        vacancy.getPublicId(),
                        resume.getId()
                )
                .orElseGet(() -> createRoom(employer, candidate, vacancy, resume, null));

        sendMessage(employer, new ChatMessageRequestDto(room.getChatId(), request.message()));

        return toRoomDto(chatRoomRepository.findFirstByChatId(room.getChatId()).orElse(room), employer);
    }

    @Transactional
    public ChatRoomResponseDto createForAcceptedApplication(Application application) {
        return chatRoomRepository.findFirstByApplicationId(application.getId())
                .map(room -> toRoomDto(room, application.getVacancy().getEmployer()))
                .orElseGet(() -> {
                    ChatRoom room = createRoom(
                            application.getVacancy().getEmployer(),
                            application.getCandidate(),
                            application.getVacancy(),
                            application.getResume(),
                            application
                    );

                    return toRoomDto(room, application.getVacancy().getEmployer());
                });
    }

    @Transactional
    public ChatMessageResponseDto sendMessage(User sender, ChatMessageRequestDto request) {
        if (request == null || request.chatId() == null || request.chatId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat is required");
        }
        if (request.content() == null || request.content().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is empty");
        }

        ChatRoom room = getParticipantRoom(sender, request.chatId());
        String senderId = String.valueOf(sender.getId());
        String recipientId = getRecipientId(room, sender);

        ChatMessage message = ChatMessage.builder()
                .chatId(room.getChatId())
                .senderId(senderId)
                .recipientId(recipientId)
                .senderName(getParticipantName(room, sender.getId()))
                .recipientName(getParticipantName(room, Integer.valueOf(recipientId)))
                .content(request.content().trim())
                .timestamp(LocalDateTime.now())
                .status(ChatMessage.MessageStatus.RECEIVED)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        room.setLastMessage(saved.getContent());
        room.setLastMessageAt(saved.getTimestamp());
        room.setUpdatedAt(saved.getTimestamp());
        chatRoomRepository.save(room);

        ChatMessageResponseDto response = toMessageDto(saved);
        notifyMessageAfterCommit(response);

        return response;
    }

    @Transactional(readOnly = true)
    public String findChatIdForApplication(Long applicationId) {
        if (applicationId == null) {
            return null;
        }

        return chatRoomRepository.findFirstByApplicationId(applicationId)
                .map(ChatRoom::getChatId)
                .orElse(null);
    }

    private ChatRoom createRoom(
            User employer,
            User candidate,
            Vacancy vacancy,
            CandidateResume resume,
            Application application
    ) {
        ChatRoom room = ChatRoom.builder()
                .employerId(employer.getId())
                .candidateId(candidate.getId())
                .senderId(String.valueOf(employer.getId()))
                .recipientId(String.valueOf(candidate.getId()))
                .employerName(getEmployerName(employer))
                .candidateName(getCandidateName(candidate))
                .employerAvatarUrl(getEmployerAvatarUrl(employer))
                .candidateAvatarUrl(candidate.getAvatarUrl())
                .vacancyPublicId(vacancy.getPublicId())
                .vacancyTitle(vacancy.getTitle())
                .resumeId(resume == null ? null : resume.getId())
                .resumeProfession(resume == null ? null : resume.getProfession())
                .applicationId(application == null ? null : application.getId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return chatRoomRepository.save(room);
    }

    private ChatRoom getParticipantRoom(User user, String chatId) {
        ChatRoom room = chatRoomRepository.findFirstByChatId(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));

        boolean isParticipant = user.getId().equals(room.getCandidateId())
                || user.getId().equals(room.getEmployerId())
                || String.valueOf(user.getId()).equals(room.getSenderId())
                || String.valueOf(user.getId()).equals(room.getRecipientId());

        if (!isParticipant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chat is not available");
        }

        return room;
    }

    private String getRecipientId(ChatRoom room, User sender) {
        Integer recipientId;

        if (sender.getId().equals(room.getCandidateId())) {
            recipientId = room.getEmployerId();
        } else if (sender.getId().equals(room.getEmployerId())) {
            recipientId = room.getCandidateId();
        } else if (String.valueOf(sender.getId()).equals(room.getSenderId())) {
            return room.getRecipientId();
        } else {
            return room.getSenderId();
        }

        if (recipientId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat participant is missing");
        }

        return String.valueOf(recipientId);
    }

    private String getParticipantName(ChatRoom room, Integer userId) {
        if (userId.equals(room.getCandidateId())) {
            return room.getCandidateName();
        }
        if (userId.equals(room.getEmployerId())) {
            return room.getEmployerName();
        }

        return "Пользователь";
    }

    private String getCandidateName(User user) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElse(null);

        if (profile == null) {
            return user.getEmail();
        }

        String name = Stream.of(profile.getFirstName(), profile.getLastName())
                .filter(value -> value != null && !value.isBlank())
                .reduce((first, second) -> first + " " + second)
                .orElse(null);

        return name == null ? user.getEmail() : name;
    }

    private String getEmployerName(User user) {
        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId()).orElse(null);

        if (profile == null || profile.getCompanyName() == null || profile.getCompanyName().isBlank()) {
            return user.getEmail();
        }

        return profile.getCompanyName();
    }

    private String getEmployerAvatarUrl(User user) {
        EmployerProfile profile = employerProfileRepository.findByUserId(user.getId()).orElse(null);

        if (profile != null && profile.getAvatarUrl() != null && !profile.getAvatarUrl().isBlank()) {
            return profile.getAvatarUrl();
        }

        return user.getAvatarUrl();
    }

    private List<ChatMessage> markIncomingMessagesAsRead(ChatRoom room, User user) {
        List<ChatMessage> unreadMessages =
                chatMessageRepository.findByChatIdAndRecipientIdAndStatusNotOrderByTimestampAsc(
                        room.getChatId(),
                        String.valueOf(user.getId()),
                        ChatMessage.MessageStatus.READ
                );

        unreadMessages.forEach(message -> message.setStatus(ChatMessage.MessageStatus.READ));

        return chatMessageRepository.saveAll(unreadMessages);
    }

    private ChatRoomResponseDto toRoomDto(ChatRoom room, User user) {
        long unreadCount = chatMessageRepository.countByChatIdAndRecipientIdAndStatusNot(
                room.getChatId(),
                String.valueOf(user.getId()),
                ChatMessage.MessageStatus.READ
        );

        return new ChatRoomResponseDto(
                room.getChatId(),
                room.getCandidateId(),
                room.getEmployerId(),
                room.getCandidateName(),
                room.getEmployerName(),
                room.getCandidateAvatarUrl(),
                room.getEmployerAvatarUrl(),
                room.getVacancyPublicId(),
                room.getVacancyTitle(),
                room.getResumeId(),
                room.getResumeProfession(),
                room.getApplicationId(),
                room.getLastMessage(),
                room.getLastMessageAt(),
                unreadCount,
                room.getCreatedAt(),
                room.getUpdatedAt()
        );
    }

    private ChatMessageResponseDto toMessageDto(ChatMessage message) {
        return new ChatMessageResponseDto(
                message.getId(),
                message.getChatId(),
                message.getSenderId(),
                message.getRecipientId(),
                message.getSenderName(),
                message.getRecipientName(),
                message.getContent(),
                message.getTimestamp(),
                message.getStatus() == null ? null : message.getStatus().name()
        );
    }

    private void notifyMessageAfterCommit(ChatMessageResponseDto message) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    chatRealtimeNotifier.sendMessage(message);
                }
            });
            return;
        }

        chatRealtimeNotifier.sendMessage(message);
    }
}
