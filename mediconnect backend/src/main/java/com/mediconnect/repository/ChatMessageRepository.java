package com.mediconnect.repository;

import com.mediconnect.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByAppointmentIdOrderBySentAtAsc(Long appointmentId);
    long countByAppointmentIdAndIsReadFalseAndSenderIdNot(Long appointmentId, Long senderId);
}
