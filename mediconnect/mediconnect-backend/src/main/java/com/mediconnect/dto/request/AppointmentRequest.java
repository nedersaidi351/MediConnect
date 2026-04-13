package com.mediconnect.dto.request;

import com.mediconnect.entity.Appointment;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {

    @NotNull(message = "L'identifiant du médecin est obligatoire")
    private Long doctorId;

    @NotNull(message = "La date du rendez-vous est obligatoire")
    @Future(message = "La date doit être dans le futur")
    private LocalDate appointmentDate;

    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime startTime;

    @NotNull(message = "L'heure de fin est obligatoire")
    private LocalTime endTime;

    @NotNull(message = "Le type de consultation est obligatoire")
    private Appointment.Type type;

    private String reason;
}
