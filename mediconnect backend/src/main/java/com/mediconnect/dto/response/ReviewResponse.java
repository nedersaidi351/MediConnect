package com.mediconnect.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private String patientName;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;
}
