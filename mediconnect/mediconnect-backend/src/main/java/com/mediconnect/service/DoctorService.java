package com.mediconnect.service;

import com.mediconnect.dto.request.AvailabilityRequest;
import com.mediconnect.dto.request.DoctorProfileRequest;
import com.mediconnect.dto.response.DoctorResponse;
import com.mediconnect.dto.response.PagedResponse;
import com.mediconnect.entity.AvailabilitySlot;
import com.mediconnect.entity.DoctorProfile;
import com.mediconnect.entity.Specialty;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ConflictException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AvailabilitySlotRepository;
import com.mediconnect.repository.DoctorProfileRepository;
import com.mediconnect.repository.SpecialtyRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SpecialtyRepository specialtyRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    @Transactional
    public DoctorResponse createProfile(Long userId, DoctorProfileRequest request) {
        if (doctorProfileRepository.existsByUserId(userId)) {
            throw new ConflictException("Ce médecin possède déjà un profil.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userId));

        if (user.getRole() != User.Role.DOCTOR) {
            throw new BadRequestException("Seuls les médecins peuvent créer un profil médecin.");
        }

        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité", request.getSpecialtyId()));

        DoctorProfile profile = DoctorProfile.builder()
                .user(user)
                .specialty(specialty)
                .licenseNumber(request.getLicenseNumber())
                .bio(request.getBio())
                .yearsExperience(request.getYearsExperience() != null ? request.getYearsExperience() : 0)
                .consultationFee(request.getConsultationFee())
                .address(request.getAddress())
                .city(request.getCity())
                .build();

        return toResponse(doctorProfileRepository.save(profile));
    }

    @Transactional
    public DoctorResponse updateProfile(Long userId, DoctorProfileRequest request) {
        DoctorProfile profile = getProfileByUserId(userId);

        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité", request.getSpecialtyId()));

        profile.setSpecialty(specialty);
        profile.setBio(request.getBio());
        profile.setYearsExperience(request.getYearsExperience());
        profile.setConsultationFee(request.getConsultationFee());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());

        return toResponse(doctorProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public DoctorResponse getMyProfile(Long userId) {
        return toResponse(getProfileByUserId(userId));
    }

    @Transactional(readOnly = true)
    public DoctorResponse getPublicProfile(Long doctorProfileId) {
        DoctorProfile profile = doctorProfileRepository.findById(doctorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin", doctorProfileId));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DoctorResponse> searchDoctors(Long specialtyId, String city, String name,
                                                        int page, int size) {
        var pageResult = doctorProfileRepository.searchDoctors(
                specialtyId, city, name,
                PageRequest.of(page, size, Sort.by("averageRating").descending())
        );
        return PagedResponse.of(pageResult.map(this::toResponse));
    }

    @Transactional
    public void setAvailability(Long userId, AvailabilityRequest request) {
        DoctorProfile profile = getProfileByUserId(userId);

        // Replace all existing slots
        availabilitySlotRepository.deleteByDoctorId(profile.getId());

        List<AvailabilitySlot> slots = request.getSlots().stream()
                .map(s -> AvailabilitySlot.builder()
                        .doctor(profile)
                        .dayOfWeek(s.getDayOfWeek())
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .build())
                .toList();

        availabilitySlotRepository.saveAll(slots);
    }

    @Transactional
    public void verifyDoctor(Long doctorProfileId) {
        DoctorProfile profile = doctorProfileRepository.findById(doctorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin", doctorProfileId));
        profile.setIsVerified(true);
        doctorProfileRepository.save(profile);
    }

    // ─── helpers ───────────────────────────────────────────────────────────────

    public DoctorProfile getProfileByUserId(Long userId) {
        return doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Profil médecin introuvable pour l'utilisateur : " + userId));
    }

    public DoctorResponse toResponse(DoctorProfile p) {
        List<DoctorResponse.AvailabilitySlotResponse> slots =
                availabilitySlotRepository.findByDoctorIdAndIsActiveTrue(p.getId())
                        .stream()
                        .map(s -> DoctorResponse.AvailabilitySlotResponse.builder()
                                .id(s.getId())
                                .dayOfWeek(s.getDayOfWeek().name())
                                .startTime(s.getStartTime().toString())
                                .endTime(s.getEndTime().toString())
                                .build())
                        .toList();

        return DoctorResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .firstName(p.getUser().getFirstName())
                .lastName(p.getUser().getLastName())
                .email(p.getUser().getEmail())
                .phone(p.getUser().getPhone())
                .specialty(p.getSpecialty().getName())
                .specialtyId(p.getSpecialty().getId())
                .licenseNumber(p.getLicenseNumber())
                .bio(p.getBio())
                .yearsExperience(p.getYearsExperience())
                .consultationFee(p.getConsultationFee())
                .avatarUrl(p.getAvatarUrl())
                .address(p.getAddress())
                .city(p.getCity())
                .isVerified(p.getIsVerified())
                .averageRating(p.getAverageRating())
                .totalReviews(p.getTotalReviews())
                .availabilitySlots(slots)
                .build();
    }
}
