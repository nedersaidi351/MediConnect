package com.mediconnect.service;

import com.mediconnect.dto.request.AppointmentRequest;
import com.mediconnect.dto.response.AppointmentResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.entity.*;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ConflictException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.DoctorProfileRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientService patientService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional
    public AppointmentResponse book(Long patientUserId, AppointmentRequest request) {
        PatientProfile patient = patientService.getProfileByUserId(patientUserId);

        DoctorProfile doctor = doctorProfileRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin", request.getDoctorId()));

        if (!doctor.getIsVerified()) {
            throw new BadRequestException("Ce médecin n'est pas encore vérifié.");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("La date du rendez-vous doit être dans le futur.");
        }

        if (appointmentRepository.existsConflict(
                doctor.getId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                request.getEndTime())) {
            throw new ConflictException("Ce créneau est déjà réservé. Veuillez choisir un autre.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .type(request.getType())
                .reason(request.getReason())
                .status(Appointment.Status.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Notify doctor
        notificationService.createAppointmentNotification(
                doctor.getUser(),
                "Nouveau rendez-vous",
                "Un rendez-vous a été demandé par " + patient.getUser().getFullName()
                        + " le " + request.getAppointmentDate()
        );

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse confirm(Long doctorUserId, Long appointmentId) {
        Appointment appointment = getAppointmentForDoctor(doctorUserId, appointmentId);
        assertStatus(appointment, Appointment.Status.PENDING, "Seuls les rendez-vous en attente peuvent être confirmés.");

        appointment.setStatus(Appointment.Status.CONFIRMED);
        appointmentRepository.save(appointment);

        notificationService.createAppointmentNotification(
                appointment.getPatient().getUser(),
                "Rendez-vous confirmé",
                "Votre rendez-vous du " + appointment.getAppointmentDate() + " a été confirmé."
        );

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancel(Long userId, Long appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor  = appointment.getDoctor().getUser().getId().equals(userId);

        if (!isPatient && !isDoctor) {
            throw new BadRequestException("Vous n'êtes pas autorisé à annuler ce rendez-vous.");
        }

        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new BadRequestException("Un rendez-vous terminé ne peut pas être annulé.");
        }

        appointment.setStatus(Appointment.Status.CANCELLED);
        appointment.setCancellationReason(reason);
        appointmentRepository.save(appointment);

        // Notify the other party
        User toNotify = isPatient
                ? appointment.getDoctor().getUser()
                : appointment.getPatient().getUser();

        notificationService.createAppointmentNotification(
                toNotify,
                "Rendez-vous annulé",
                "Le rendez-vous du " + appointment.getAppointmentDate() + " a été annulé."
        );

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse complete(Long doctorUserId, Long appointmentId) {
        Appointment appointment = getAppointmentForDoctor(doctorUserId, appointmentId);
        assertStatus(appointment, Appointment.Status.CONFIRMED, "Seuls les rendez-vous confirmés peuvent être complétés.");

        appointment.setStatus(Appointment.Status.COMPLETED);
        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getPatientAppointments(Long patientUserId, int page, int size) {
        PatientProfile patient = patientService.getProfileByUserId(patientUserId);
        var result = appointmentRepository
                .findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patient.getId(), PageRequest.of(page, size));
        return PagedResponse.of(result.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getDoctorAppointments(Long doctorUserId, int page, int size) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Profil médecin introuvable pour l'utilisateur : " + doctorUserId));
        var result = appointmentRepository
                .findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(doctor.getId(), PageRequest.of(page, size));
        return PagedResponse.of(result.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorDailySchedule(Long doctorUserId, LocalDate date) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Profil médecin introuvable pour l'utilisateur : " + doctorUserId));
        return appointmentRepository
                .findDoctorAppointmentsByDate(doctor.getId(), date)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long appointmentId) {
        return toResponse(appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId)));
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private Appointment getAppointmentForDoctor(Long doctorUserId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", appointmentId));
        if (!appointment.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new BadRequestException("Vous n'êtes pas autorisé à modifier ce rendez-vous.");
        }
        return appointment;
    }

    private void assertStatus(Appointment appointment, Appointment.Status expected, String message) {
        if (appointment.getStatus() != expected) {
            throw new BadRequestException(message);
        }
    }

    public AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getUser().getFullName())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getUser().getFullName())
                .specialty(a.getDoctor().getSpecialty().getName())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .type(a.getType())
                .reason(a.getReason())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
