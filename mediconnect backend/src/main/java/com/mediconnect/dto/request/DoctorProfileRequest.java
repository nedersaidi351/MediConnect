package com.mediconnect.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DoctorProfileRequest {

    @NotNull(message = "La spécialité est obligatoire")
    private Long specialtyId;

    @NotBlank(message = "Le numéro de licence est obligatoire")
    private String licenseNumber;

    @Size(max = 2000)
    private String bio;

    @Min(0) @Max(60)
    private Integer yearsExperience;

    @DecimalMin("0.0")
    private BigDecimal consultationFee;

    private String address;
    private String city;
}
