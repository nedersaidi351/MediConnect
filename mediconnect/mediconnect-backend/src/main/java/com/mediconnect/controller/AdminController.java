package com.mediconnect.controller;

import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.dto.response.DoctorResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Tableau de bord et gestion de la plateforme")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Statistiques générales de la plateforme")
    public ResponseEntity<ApiResponse<AdminService.DashboardStats>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    @GetMapping("/doctors/pending")
    @Operation(summary = "Liste des médecins en attente de vérification")
    public ResponseEntity<ApiResponse<PagedResponse<DoctorResponse>>> pendingDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPendingDoctors(page, size)));
    }

    @PatchMapping("/doctors/{id}/verify")
    @Operation(summary = "Valider le compte d'un médecin")
    public ResponseEntity<ApiResponse<Void>> verifyDoctor(@PathVariable Long id) {
        adminService.verifyDoctor(id);
        return ResponseEntity.ok(ApiResponse.ok("Médecin vérifié avec succès.", null));
    }

    @PatchMapping("/users/{id}/toggle")
    @Operation(summary = "Activer / désactiver un compte utilisateur")
    public ResponseEntity<ApiResponse<Void>> toggleUser(@PathVariable Long id) {
        adminService.toggleUserEnabled(id);
        return ResponseEntity.ok(ApiResponse.ok("Statut du compte modifié.", null));
    }

    @GetMapping("/users")
    @Operation(summary = "Liste de tous les utilisateurs")
    public ResponseEntity<ApiResponse<PagedResponse<AdminService.UserSummary>>> allUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers(page, size)));
    }
}
