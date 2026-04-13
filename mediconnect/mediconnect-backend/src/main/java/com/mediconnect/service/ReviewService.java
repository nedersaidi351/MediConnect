package com.mediconnect.service;

import com.mediconnect.dto.request.ReviewRequest;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.dto.response.ReviewResponse;
import com.mediconnect.entity.*;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ConflictException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.DoctorProfileRepository;
import com.mediconnect.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientService patientService;

    @Transactional
    public ReviewResponse addReview(Long patientUserId, Long doctorProfileId, ReviewRequest request) {
        PatientProfile patient = patientService.getProfileByUserId(patientUserId);

        DoctorProfile doctor = doctorProfileRepository.findById(doctorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin", doctorProfileId));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", request.getAppointmentId()));

        if (!appointment.getStatus().equals(Appointment.Status.COMPLETED)) {
            throw new BadRequestException("Vous ne pouvez noter qu'un rendez-vous terminé.");
        }

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new BadRequestException("Ce rendez-vous ne vous appartient pas.");
        }

        if (reviewRepository.existsByDoctorIdAndPatientIdAndAppointmentId(
                doctor.getId(), patient.getId(), appointment.getId())) {
            throw new ConflictException("Vous avez déjà noté ce médecin pour ce rendez-vous.");
        }

        Review review = Review.builder()
                .doctor(doctor)
                .patient(patient)
                .appointment(appointment)
                .rating(request.getRating())
                .comment(request.getComment())
                .isAnonymous(request.isAnonymous())
                .build();

        reviewRepository.save(review);
        recalculateDoctorRating(doctor);

        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getDoctorReviews(Long doctorProfileId, int page, int size) {
        var result = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(
                doctorProfileId, PageRequest.of(page, size));
        return PagedResponse.of(result.map(this::toResponse));
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private void recalculateDoctorRating(DoctorProfile doctor) {
        double avg = reviewRepository.findAverageRatingByDoctorId(doctor.getId()).orElse(0.0);
        long count = reviewRepository.countByDoctorId(doctor.getId());
        doctor.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        doctor.setTotalReviews((int) count);
        doctorProfileRepository.save(doctor);
    }

    private ReviewResponse toResponse(Review r) {
        String patientName = r.getIsAnonymous()
                ? "Patient anonyme"
                : r.getPatient().getUser().getFullName();
        return ReviewResponse.builder()
                .id(r.getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .patientName(patientName)
                .isAnonymous(r.getIsAnonymous())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
