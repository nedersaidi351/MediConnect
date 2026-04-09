package com.mediconnect.service;

import com.mediconnect.dto.request.PatientProfileRequest;
import com.mediconnect.dto.response.AppointmentResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.entity.PatientProfile;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ConflictException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.PatientProfileRepository;
import com.mediconnect.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public PatientProfileResponse createOrUpdateProfile(Long userId, PatientProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userId));

        if (user.getRole() != User.Role.PATIENT) {
            throw new BadRequestException("Seuls les patients peuvent créer un profil patient.");
        }

        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElse(PatientProfile.builder().user(user).build());

        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setBloodType(request.getBloodType());
        profile.setAllergies(request.getAllergies());
        profile.setChronicDiseases(request.getChronicDiseases());
        profile.setEmergencyContactName(request.getEmergencyContactName());
        profile.setEmergencyContactPhone(request.getEmergencyContactPhone());

        return toResponse(patientProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getMyProfile(Long userId) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Profil patient introuvable pour l'utilisateur : " + userId));
        return toResponse(profile);
    }

    public PatientProfile getProfileByUserId(Long userId) {
        return patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Profil patient introuvable pour l'utilisateur : " + userId));
    }

    public PatientProfileResponse toResponse(PatientProfile p) {
        return PatientProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .firstName(p.getUser().getFirstName())
                .lastName(p.getUser().getLastName())
                .email(p.getUser().getEmail())
                .phone(p.getUser().getPhone())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender() != null ? p.getGender().name() : null)
                .bloodType(p.getBloodType())
                .allergies(p.getAllergies())
                .chronicDiseases(p.getChronicDiseases())
                .emergencyContactName(p.getEmergencyContactName())
                .emergencyContactPhone(p.getEmergencyContactPhone())
                .avatarUrl(p.getAvatarUrl())
                .build();
    }

    // ─── Embedded response DTO ─────────────────────────────────────────────────
    @Data @Builder
    public static class PatientProfileResponse {
        private Long id;
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String bloodType;
        private String allergies;
        private String chronicDiseases;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String avatarUrl;
    }
}
