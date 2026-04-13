package com.mediconnect.repository;

import com.mediconnect.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(Long doctorId, Pageable pageable);

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.doctor.id = :doctorId
        AND a.appointmentDate = :date
        AND a.status NOT IN ('CANCELLED')
        ORDER BY a.startTime
        """)
    List<Appointment> findDoctorAppointmentsByDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date
    );

    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.doctor.id = :doctorId
        AND a.appointmentDate = :date
        AND a.status NOT IN ('CANCELLED')
        AND (
            (a.startTime < :endTime AND a.endTime > :startTime)
        )
        """)
    boolean existsConflict(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    List<Appointment> findByAppointmentDateAndStatus(LocalDate date, Appointment.Status status);

    Page<Appointment> findAllByOrderByAppointmentDateDescStartTimeDesc(Pageable pageable);

    Page<Appointment> findByStatusOrderByAppointmentDateDescStartTimeDesc(Appointment.Status status, Pageable pageable);

    long countByStatus(Appointment.Status status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date AND a.status != 'CANCELLED'")
    long countByDate(@Param("date") LocalDate date);
}
