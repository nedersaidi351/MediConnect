package com.mediconnect.service;

import com.mediconnect.dto.request.ChatMessageRequest;
import com.mediconnect.dto.response.ChatMessageResponse;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.ChatMessage;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.ChatMessageRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatMessageResponse sendMessage(Long senderUserId, ChatMessageRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", request.getAppointmentId()));

        assertParticipant(senderUserId, appointment);

        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Impossible d'envoyer un message sur un rendez-vous annulé.");
        }

        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", senderUserId));

        ChatMessage message = ChatMessage.builder()
                .appointment(appointment)
                .sender(sender)
                .content(request.getContent())
                .messageType(request.getMessageType())
                .build();

        message = chatMessageRepository.save(message);
        ChatMessageResponse response = toResponse(message);

        // Push via WebSocket to the appointment room
        messagingTemplate.convertAndSend(
                "/topic/appointment." + appointment.getId(),
                response
        );

        return response;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long userId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));

        assertParticipant(userId, appointment);

        return chatMessageRepository
                .findByAppointmentIdOrderBySentAtAsc(appointmentId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void markMessagesAsRead(Long userId, Long appointmentId) {
        List<ChatMessage> unread = chatMessageRepository
                .findByAppointmentIdOrderBySentAtAsc(appointmentId)
                .stream()
                .filter(m -> !m.getSender().getId().equals(userId) && !m.getIsRead())
                .toList();

        unread.forEach(m -> m.setIsRead(true));
        chatMessageRepository.saveAll(unread);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private void assertParticipant(Long userId, Appointment appointment) {
        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor  = appointment.getDoctor().getUser().getId().equals(userId);
        if (!isPatient && !isDoctor) {
            throw new BadRequestException("Vous n'êtes pas participant à cette consultation.");
        }
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        return ChatMessageResponse.builder()
                .id(m.getId())
                .appointmentId(m.getAppointment().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFullName())
                .content(m.getContent())
                .messageType(m.getMessageType())
                .fileUrl(m.getFileUrl())
                .isRead(m.getIsRead())
                .sentAt(m.getSentAt())
                .build();
    }
}
