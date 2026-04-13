package com.mediconnect.dto.request;

import com.mediconnect.entity.ChatMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatMessageRequest {

    @NotNull
    private Long appointmentId;

    @NotBlank
    private String content;

    private ChatMessage.MessageType messageType = ChatMessage.MessageType.TEXT;
}
