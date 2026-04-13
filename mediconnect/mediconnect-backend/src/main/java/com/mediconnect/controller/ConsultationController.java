package com.mediconnect.controller;

import com.mediconnect.dto.request.ConsultationRequest;
import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.security.UserDetailsImpl;
import com.mediconnect.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Gestion des sessions de consultation médicale")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/{appointmentId}/start")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Démarrer une consultation")
    public ResponseEntity<ApiResponse<ConsultationService.ConsultationResponse>> start(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok("Consultation démarrée.",
                consultationService.startConsultation(user.getId(), appointmentId)));
    }

    @PutMapping("/{appointmentId}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Sauvegarder le diagnostic et la prescription")
    public ResponseEntity<ApiResponse<ConsultationService.ConsultationResponse>> saveNotes(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long appointmentId,
            @RequestBody ConsultationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Notes sauvegardées.",
                consultationService.saveConsultationNotes(user.getId(), appointmentId, request)));
    }

    @PostMapping("/{appointmentId}/end")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Terminer une consultation")
    public ResponseEntity<ApiResponse<ConsultationService.ConsultationResponse>> end(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok("Consultation terminée.",
                consultationService.endConsultation(user.getId(), appointmentId)));
    }

    @GetMapping("/{appointmentId}")
    @Operation(summary = "Consulter le compte-rendu d'une consultation")
    public ResponseEntity<ApiResponse<ConsultationService.ConsultationResponse>> get(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getConsultation(appointmentId)));
    }
}
