package com.mediconnect.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ConsultationRequest {
    private String diagnosis;
    private String prescription;
    private String notes;
    private LocalDate followUpDate;
}
