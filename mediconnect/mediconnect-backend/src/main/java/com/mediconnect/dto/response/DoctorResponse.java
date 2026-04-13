package com.mediconnect.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DoctorResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String specialty;
    private Long specialtyId;
    private String licenseNumber;
    private String bio;
    private Integer yearsExperience;
    private BigDecimal consultationFee;
    private String avatarUrl;
    private String address;
    private String city;
    private Boolean isVerified;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private List<AvailabilitySlotResponse> availabilitySlots;

    @Data @Builder
    public static class AvailabilitySlotResponse {
        private Long id;
        private String dayOfWeek;
        private String startTime;
        private String endTime;
    }
}
