package com.mediconnect.controller;

import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.dto.response.AppointmentResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.service.SecretaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/secretary")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SECRETARY', 'ADMIN')")
@Tag(name = "Secrétaire", description = "Gestion des rendez-vous par la secrétaire médicale")
public class SecretaryController {

    private final SecretaryService secretaryService;

    @GetMapping("/appointments")
    @Operation(summary = "Tous les rendez-vous (avec filtre optionnel par statut)")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                secretaryService.getAllAppointments(page, size, status)));
    }

    @PatchMapping("/appointments/{id}/confirm")
    @Operation(summary = "Confirmer un rendez-vous au nom du médecin")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous confirmé.",
                secretaryService.confirmAppointment(id)));
    }

    @PatchMapping("/appointments/{id}/cancel")
    @Operation(summary = "Annuler un rendez-vous")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous annulé.",
                secretaryService.cancelAppointment(id, reason)));
    }

    @PostMapping("/appointments/{id}/reminder")
    @Operation(summary = "Envoyer un rappel au patient")
    public ResponseEntity<ApiResponse<Void>> sendReminder(@PathVariable Long id) {
        secretaryService.sendReminder(id);
        return ResponseEntity.ok(ApiResponse.ok("Rappel envoyé au patient.", null));
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques du tableau de bord secrétaire")
    public ResponseEntity<ApiResponse<SecretaryService.DashboardStats>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(secretaryService.getStats()));
    }

    @GetMapping("/patients")
    @Operation(summary = "Liste des patients")
    public ResponseEntity<ApiResponse<PagedResponse<SecretaryService.PatientSummary>>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(secretaryService.getPatients(page, size)));
    }
}
