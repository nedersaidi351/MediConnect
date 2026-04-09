package com.mediconnect.dto.response;

import com.mediconnect.entity.ChatMessage;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ChatMessageResponse {
    private Long id;
    private Long appointmentId;
    private Long senderId;
    private String senderName;
    private String content;
    private ChatMessage.MessageType messageType;
    private String fileUrl;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
