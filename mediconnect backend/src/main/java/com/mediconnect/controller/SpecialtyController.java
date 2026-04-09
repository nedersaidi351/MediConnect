package com.mediconnect.controller;

import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.entity.Specialty;
import com.mediconnect.repository.SpecialtyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/specialties")
@RequiredArgsConstructor
@Tag(name = "Spécialités", description = "Liste des spécialités médicales disponibles")
public class SpecialtyController {

    private final SpecialtyRepository specialtyRepository;

    @GetMapping
    @Operation(summary = "Lister toutes les spécialités médicales")
    public ResponseEntity<ApiResponse<List<Specialty>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(specialtyRepository.findAll()));
    }
}
