package com.mediconnect.service;

import com.mediconnect.dto.response.NotificationResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.entity.Notification;
import com.mediconnect.entity.User;
import com.mediconnect.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createSystemNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type("SYSTEM")
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void createAppointmentNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type("APPOINTMENT")
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getMyNotifications(Long userId, int page, int size) {
        var pageResult = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        return PagedResponse.of(pageResult.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
