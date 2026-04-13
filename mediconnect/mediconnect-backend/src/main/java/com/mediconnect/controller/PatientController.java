package com.mediconnect.controller;

import com.mediconnect.dto.request.PatientProfileRequest;
import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.security.UserDetailsImpl;
import com.mediconnect.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Gestion du profil patient")
public class PatientController {

    private final PatientService patientService;

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Créer ou mettre à jour le profil patient")
    public ResponseEntity<ApiResponse<PatientService.PatientProfileResponse>> saveProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody PatientProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profil mis à jour.",
                patientService.createOrUpdateProfile(user.getId(), request)));
    }

    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Consulter son profil patient")
    public ResponseEntity<ApiResponse<PatientService.PatientProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getMyProfile(user.getId())));
    }
}
