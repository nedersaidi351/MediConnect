package com.mediconnect.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull
    private Long appointmentId;

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    @Size(max = 1000)
    private String comment;

    private boolean anonymous = false;
}
