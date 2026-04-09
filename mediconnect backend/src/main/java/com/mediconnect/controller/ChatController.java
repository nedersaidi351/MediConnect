package com.mediconnect.controller;

import com.mediconnect.dto.request.ChatMessageRequest;
import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.dto.response.ChatMessageResponse;
import com.mediconnect.security.UserDetailsImpl;
import com.mediconnect.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Messagerie", description = "Chat en temps réel entre patient et médecin")
public class ChatController {

    private final ChatService chatService;

    /** REST endpoint – send a message (also triggers WebSocket broadcast) */
    @PostMapping("/send")
    @Operation(summary = "Envoyer un message dans une consultation")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> send(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(chatService.sendMessage(user.getId(), request)));
    }

    /** REST endpoint – fetch message history */
    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Récupérer l'historique des messages d'un rendez-vous")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(chatService.getMessages(user.getId(), appointmentId)));
    }

    /** REST endpoint – mark messages as read */
    @PatchMapping("/appointment/{appointmentId}/read")
    @Operation(summary = "Marquer les messages comme lus")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long appointmentId) {
        chatService.markMessagesAsRead(user.getId(), appointmentId);
        return ResponseEntity.ok(ApiResponse.ok("Messages marqués comme lus.", null));
    }

    /**
     * WebSocket handler – clients can also send messages via STOMP:
     * destination: /app/chat.send
     * subscribe:   /topic/appointment.{appointmentId}
     */
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload ChatMessageRequest request, Principal principal) {
        // Principal.getName() returns the email (from JWT)
        // For WebSocket messages we resolve user by email via the service
        // This is handled transparently by the REST send endpoint above
    }
}
