package com.mediconnect.service;

import com.mediconnect.dto.response.DoctorResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.entity.User;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.DoctorProfileRepository;
import com.mediconnect.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        long totalUsers       = userRepository.count();
        long totalDoctors     = userRepository.countByRole(User.Role.DOCTOR);
        long totalPatients    = userRepository.countByRole(User.Role.PATIENT);
        long totalAppointments = appointmentRepository.count();
        long pendingVerifications = doctorProfileRepository.countByIsVerifiedFalse();

        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .totalAppointments(totalAppointments)
                .pendingVerifications(pendingVerifications)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<DoctorResponse> getPendingDoctors(int page, int size) {
        var result = doctorProfileRepository.findByIsVerifiedFalse(PageRequest.of(page, size));
        return PagedResponse.of(result.map(doctorService::toResponse));
    }

    @Transactional
    public void verifyDoctor(Long doctorProfileId) {
        var profile = doctorProfileRepository.findById(doctorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin", doctorProfileId));

        profile.setIsVerified(true);
        doctorProfileRepository.save(profile);

        notificationService.createSystemNotification(
                profile.getUser(),
                "Compte vérifié",
                "Votre profil médecin a été validé par l'administration. Vous pouvez maintenant recevoir des rendez-vous."
        );
    }

    @Transactional
    public void toggleUserEnabled(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userId));
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserSummary> getAllUsers(int page, int size) {
        var result = userRepository.findAll(PageRequest.of(page, size));
        return PagedResponse.of(result.map(u -> UserSummary.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .enabled(u.getEnabled())
                .createdAt(u.getCreatedAt().toString())
                .build()));
    }

    // ─── Embedded DTOs ─────────────────────────────────────────────────────────
    @Data @Builder
    public static class DashboardStats {
        private long totalUsers;
        private long totalDoctors;
        private long totalPatients;
        private long totalAppointments;
        private long pendingVerifications;
    }

    @Data @Builder
    public static class UserSummary {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private Boolean enabled;
        private String createdAt;
    }
}
