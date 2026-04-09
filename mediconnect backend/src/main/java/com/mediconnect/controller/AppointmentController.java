package com.mediconnect.controller;

import com.mediconnect.dto.request.AppointmentRequest;
import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.dto.response.AppointmentResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.security.UserDetailsImpl;
import com.mediconnect.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Rendez-vous", description = "Réservation et gestion des rendez-vous")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Réserver un rendez-vous")
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rendez-vous demandé avec succès.",
                        appointmentService.book(user.getId(), request)));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Confirmer un rendez-vous")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirm(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous confirmé.",
                appointmentService.confirm(user.getId(), id)));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Annuler un rendez-vous (patient ou médecin)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous annulé.",
                appointmentService.cancel(user.getId(), id, reason)));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Marquer un rendez-vous comme terminé")
    public ResponseEntity<ApiResponse<AppointmentResponse>> complete(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Consultation terminée.",
                appointmentService.complete(user.getId(), id)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Mes rendez-vous (patient)")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> myAppointments(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentService.getPatientAppointments(user.getId(), page, size)));
    }

    @GetMapping("/doctor/my")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Mes rendez-vous (médecin)")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> doctorAppointments(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentService.getDoctorAppointments(user.getId(), page, size)));
    }

    @GetMapping("/doctor/schedule")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Agenda quotidien du médecin")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> dailySchedule(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentService.getDoctorDailySchedule(user.getId(), date)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un rendez-vous")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getById(id)));
    }
}
