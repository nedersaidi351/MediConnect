package com.mediconnect.service;

import com.mediconnect.dto.request.ConsultationRequest;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.Consultation;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ConflictException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final AppointmentRepository appointmentRepository;

    @Transactional
    public ConsultationResponse startConsultation(Long doctorUserId, Long appointmentId) {
        Appointment appointment = getVerifiedAppointment(doctorUserId, appointmentId);

        if (appointment.getConsultation() != null) {
            throw new ConflictException("Une consultation est déjà en cours pour ce rendez-vous.");
        }

        Consultation consultation = Consultation.builder()
                .appointment(appointment)
                .startedAt(LocalDateTime.now())
                .build();

        appointment.setConsultation(consultation);
        appointmentRepository.save(appointment);

        return toResponse(consultation);
    }

    @Transactional
    public ConsultationResponse saveConsultationNotes(Long doctorUserId, Long appointmentId,
                                                       ConsultationRequest request) {
        Appointment appointment = getVerifiedAppointment(doctorUserId, appointmentId);

        if (appointment.getConsultation() == null) {
            throw new BadRequestException("Aucune consultation active pour ce rendez-vous.");
        }

        Consultation consultation = appointment.getConsultation();
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setPrescription(request.getPrescription());
        consultation.setNotes(request.getNotes());
        consultation.setFollowUpDate(request.getFollowUpDate());

        appointmentRepository.save(appointment);
        return toResponse(consultation);
    }

    @Transactional
    public ConsultationResponse endConsultation(Long doctorUserId, Long appointmentId) {
        Appointment appointment = getVerifiedAppointment(doctorUserId, appointmentId);

        if (appointment.getConsultation() == null) {
            throw new BadRequestException("Aucune consultation active pour ce rendez-vous.");
        }

        Consultation consultation = appointment.getConsultation();
        LocalDateTime now = LocalDateTime.now();
        consultation.setEndedAt(now);

        if (consultation.getStartedAt() != null) {
            long minutes = ChronoUnit.MINUTES.between(consultation.getStartedAt(), now);
            consultation.setDurationMinutes((int) minutes);
        }

        appointment.setStatus(Appointment.Status.COMPLETED);
        appointmentRepository.save(appointment);

        return toResponse(consultation);
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getConsultation(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));

        if (appointment.getConsultation() == null) {
            throw new ResourceNotFoundException("Aucune consultation trouvée pour ce rendez-vous.");
        }

        return toResponse(appointment.getConsultation());
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private Appointment getVerifiedAppointment(Long doctorUserId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));

        if (!appointment.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new BadRequestException("Vous n'êtes pas autorisé à accéder à cette consultation.");
        }

        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Ce rendez-vous a été annulé.");
        }

        return appointment;
    }

    private ConsultationResponse toResponse(Consultation c) {
        return ConsultationResponse.builder()
                .id(c.getId())
                .appointmentId(c.getAppointment().getId())
                .diagnosis(c.getDiagnosis())
                .prescription(c.getPrescription())
                .notes(c.getNotes())
                .followUpDate(c.getFollowUpDate())
                .durationMinutes(c.getDurationMinutes())
                .startedAt(c.getStartedAt())
                .endedAt(c.getEndedAt())
                .build();
    }

    // ─── Embedded response DTO ─────────────────────────────────────────────────
    @Data @Builder
    public static class ConsultationResponse {
        private Long id;
        private Long appointmentId;
        private String diagnosis;
        private String prescription;
        private String notes;
        private LocalDate followUpDate;
        private Integer durationMinutes;
        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
    }
}
