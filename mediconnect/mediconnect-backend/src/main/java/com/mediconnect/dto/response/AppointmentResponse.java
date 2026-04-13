package com.mediconnect.dto.response;

import com.mediconnect.entity.Appointment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Appointment.Status status;
    private Appointment.Type type;
    private String reason;
    private String notes;
    private LocalDateTime createdAt;
}
