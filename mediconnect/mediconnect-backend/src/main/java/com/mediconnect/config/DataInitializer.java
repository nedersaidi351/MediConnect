package com.mediconnect.config;

import com.mediconnect.entity.User;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("patient@test.com",    "password", "Patient",   "Test", User.Role.PATIENT);
        seedUser("doctor@test.com",     "password", "Doctor",    "Test", User.Role.DOCTOR);
        seedUser("secretary@test.com",  "password", "Secrétaire","Test", User.Role.SECRETARY);
        seedUser("admin@test.com",      "password", "Admin",     "Test", User.Role.ADMIN);
    }

    private void seedUser(String email, String password, String firstName, String lastName, User.Role role) {
        userRepository.findByEmail(email).ifPresentOrElse(
            existing -> {
                existing.setPassword(passwordEncoder.encode(password));
                existing.setEnabled(true);
                userRepository.save(existing);
                log.info("Reset password for test user: {}", email);
            },
            () -> {
                User user = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode(password))
                        .firstName(firstName)
                        .lastName(lastName)
                        .role(role)
                        .enabled(true)
                        .build();
                userRepository.save(user);
                log.info("Seeded test user: {} ({})", email, role);
            }
        );
    }
}
