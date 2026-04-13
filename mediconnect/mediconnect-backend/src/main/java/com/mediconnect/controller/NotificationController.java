package com.mediconnect.controller;

import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.dto.response.NotificationResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.security.UserDetailsImpl;
import com.mediconnect.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Gestion des notifications utilisateur")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Mes notifications")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                notificationService.getMyNotifications(user.getId(), page, size)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Nombre de notifications non lues")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.countUnread(user.getId())));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marquer toutes les notifications comme lues")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetailsImpl user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Toutes les notifications sont marquées comme lues.", null));
    }
}
