package com.mediconnect.controller;

import com.mediconnect.dto.request.ReviewRequest;
import com.mediconnect.dto.response.ApiResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.dto.response.ReviewResponse;
import com.mediconnect.security.UserDetailsImpl;
import com.mediconnect.service.ReviewService;
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
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Avis", description = "Notation et commentaires des médecins")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/doctors/{doctorId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Laisser un avis sur un médecin")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long doctorId,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Avis ajouté.",
                        reviewService.addReview(user.getId(), doctorId, request)));
    }

    @GetMapping("/doctors/{doctorId}")
    @Operation(summary = "Lister les avis d'un médecin")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getDoctorReviews(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getDoctorReviews(doctorId, page, size)));
    }
}
