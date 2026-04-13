package com.mediconnect.service;

import com.mediconnect.dto.response.AppointmentResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SecretaryService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final AppointmentService appointmentService;

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getAllAppointments(int page, int size, String status) {
        if (status != null && !status.isBlank()) {
            Appointment.Status statusEnum = Appointment.Status.valueOf(status.toUpperCase());
            var result = appointmentRepository
                    .findByStatusOrderByAppointmentDateDescStartTimeDesc(statusEnum, PageRequest.of(page, size));
            return PagedResponse.of(result.map(appointmentService::toResponse));
        }
        var result = appointmentRepository
                .findAllByOrderByAppointmentDateDescStartTimeDesc(PageRequest.of(page, size));
        return PagedResponse.of(result.map(appointmentService::toResponse));
    }

    @Transactional
    public AppointmentResponse confirmAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));

        if (appointment.getStatus() != Appointment.Status.PENDING) {
            throw new BadRequestException("Seuls les rendez-vous en attente peuvent être confirmés.");
        }

        appointment.setStatus(Appointment.Status.CONFIRMED);
        appointmentRepository.save(appointment);

        notificationService.createAppointmentNotification(
                appointment.getPatient().getUser(),
                "Rendez-vous confirmé",
                "Votre rendez-vous du " + appointment.getAppointmentDate()
                        + " a été confirmé par la secrétaire médicale."
        );
        notificationService.createAppointmentNotification(
                appointment.getDoctor().getUser(),
                "Rendez-vous confirmé",
                "Le rendez-vous du " + appointment.getAppointmentDate()
                        + " avec " + appointment.getPatient().getUser().getFullName() + " a été confirmé."
        );

        return appointmentService.toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));

        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new BadRequestException("Un rendez-vous terminé ne peut pas être annulé.");
        }
        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Ce rendez-vous est déjà annulé.");
        }

        appointment.setStatus(Appointment.Status.CANCELLED);
        appointment.setCancellationReason(reason);
        appointmentRepository.save(appointment);

        notificationService.createAppointmentNotification(
                appointment.getPatient().getUser(),
                "Rendez-vous annulé",
                "Votre rendez-vous du " + appointment.getAppointmentDate()
                        + " a été annulé par la secrétaire médicale."
                        + (reason != null && !reason.isBlank() ? " Raison : " + reason : "")
        );
        notificationService.createAppointmentNotification(
                appointment.getDoctor().getUser(),
                "Rendez-vous annulé",
                "Le rendez-vous du " + appointment.getAppointmentDate()
                        + " avec " + appointment.getPatient().getUser().getFullName() + " a été annulé."
        );

        return appointmentService.toResponse(appointment);
    }

    @Transactional
    public void sendReminder(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));

        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Impossible d'envoyer un rappel pour un rendez-vous annulé.");
        }

        notificationService.createAppointmentNotification(
                appointment.getPatient().getUser(),
                "Rappel de rendez-vous",
                "Rappel : vous avez un rendez-vous le " + appointment.getAppointmentDate()
                        + " à " + appointment.getStartTime()
                        + " avec Dr. " + appointment.getDoctor().getUser().getFullName()
                        + ". Type : " + appointment.getType().name().toLowerCase() + "."
        );
    }

    @Transactional(readOnly = true)
    public DashboardStats getStats() {
        long total     = appointmentRepository.count();
        long pending   = appointmentRepository.countByStatus(Appointment.Status.PENDING);
        long confirmed = appointmentRepository.countByStatus(Appointment.Status.CONFIRMED);
        long today     = appointmentRepository.countByDate(LocalDate.now());
        long patients  = userRepository.countByRole(User.Role.PATIENT);
        long doctors   = userRepository.countByRole(User.Role.DOCTOR);

        return DashboardStats.builder()
                .totalAppointments(total)
                .pendingAppointments(pending)
                .confirmedAppointments(confirmed)
                .todayAppointments(today)
                .totalPatients(patients)
                .totalDoctors(doctors)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<PatientSummary> getPatients(int page, int size) {
        var result = userRepository.findByRole(User.Role.PATIENT, PageRequest.of(page, size))
                .map(u -> PatientSummary.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .enabled(u.getEnabled())
                        .build());
        return PagedResponse.of(result);
    }

    // ─── Embedded DTOs ─────────────────────────────────────────────────────────

    @Data @Builder
    public static class DashboardStats {
        private long totalAppointments;
        private long pendingAppointments;
        private long confirmedAppointments;
        private long todayAppointments;
        private long totalPatients;
        private long totalDoctors;
    }

    @Data @Builder
    public static class PatientSummary {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private Boolean enabled;
    }
}
