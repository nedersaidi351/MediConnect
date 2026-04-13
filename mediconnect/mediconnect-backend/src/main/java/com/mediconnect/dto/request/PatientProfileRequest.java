package com.mediconnect.dto.request;

import com.mediconnect.entity.PatientProfile;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProfileRequest {
    private LocalDate dateOfBirth;
    private PatientProfile.Gender gender;
    private String bloodType;
    private String allergies;
    private String chronicDiseases;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
