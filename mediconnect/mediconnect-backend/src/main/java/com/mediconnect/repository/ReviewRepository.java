package com.mediconnect.repository;

import com.mediconnect.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByDoctorIdOrderByCreatedAtDesc(Long doctorId, Pageable pageable);

    boolean existsByDoctorIdAndPatientIdAndAppointmentId(Long doctorId, Long patientId, Long appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Optional<Double> findAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    long countByDoctorId(Long doctorId);
}
