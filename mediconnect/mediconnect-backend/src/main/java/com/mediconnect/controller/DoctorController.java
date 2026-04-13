package com.mediconnect.controller;

import com.mediconnect.dto.request.AvailabilityRequest;
import com.mediconnect.dto.request.DoctorProfileRequest;
import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.dto.response.DoctorResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.security.UserDetailsImpl;
import com.mediconnect.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@Tag(name = "Médecins", description = "Gestion des profils et disponibilités médecins")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Créer son profil médecin")
    public ResponseEntity<ApiResponse<DoctorResponse>> createProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody DoctorProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Profil créé.", doctorService.createProfile(user.getId(), request)));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Mettre à jour son profil médecin")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody DoctorProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profil mis à jour.", doctorService.updateProfile(user.getId(), request)));
    }

    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Consulter son propre profil")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getMyProfile(user.getId())));
    }

    @GetMapping("/{id}/public")
    @Operation(summary = "Consulter le profil public d'un médecin")
    public ResponseEntity<ApiResponse<DoctorResponse>> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getPublicProfile(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des médecins (spécialité, ville, nom)")
    public ResponseEntity<ApiResponse<PagedResponse<DoctorResponse>>> search(
            @RequestParam(required = false) Long specialtyId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorService.searchDoctors(specialtyId, city, name, page, size)));
    }

    @PutMapping("/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Définir ses créneaux de disponibilité")
    public ResponseEntity<ApiResponse<Void>> setAvailability(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody AvailabilityRequest request) {
        doctorService.setAvailability(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Disponibilités mises à jour.", null));
    }
}
