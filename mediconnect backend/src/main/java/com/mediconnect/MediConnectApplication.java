package com.mediconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * MediConnect - Online Medical Consultation Platform
 * Final Year Project (PFE) - Nader Saidi
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class MediConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediConnectApplication.class, args);
    }
}
