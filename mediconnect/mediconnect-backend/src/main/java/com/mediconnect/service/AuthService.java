package com.mediconnect.service;

import com.mediconnect.dto.request.LoginRequest;
import com.mediconnect.dto.request.RegisterRequest;
import com.mediconnect.dto.response.AuthResponse;
import com.mediconnect.entity.RefreshToken;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ConflictException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.RefreshTokenRepository;
import com.mediconnect.repository.UserRepository;
import com.mediconnect.security.JwtUtils;
import com.mediconnect.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final NotificationService notificationService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Un compte avec cet email existe déjà.");
        }

        // ADMIN role cannot be self-registered
        if (request.getRole() == User.Role.ADMIN) {
            throw new BadRequestException("Le rôle ADMIN ne peut pas être auto-attribué.");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .enabled(true) // set false if email verification is required
                .build();

        userRepository.save(user);

        notificationService.createSystemNotification(
                user,
                "Bienvenue sur MediConnect !",
                "Votre compte a été créé avec succès. Bonne consultation !"
        );

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return buildAuthResponse(authentication, user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userDetails.getId()));

        return buildAuthResponse(authentication, user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new BadRequestException("Refresh token invalide ou expiré."));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("Refresh token expiré. Veuillez vous reconnecter.");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtUtils.generateTokenFromEmail(
                user.getEmail(), user.getId(), user.getRole().name()
        );

        // Rotate refresh token
        refreshTokenRepository.delete(refreshToken);
        String newRefreshToken = createRefreshToken(user);

        return AuthResponse.of(newAccessToken, newRefreshToken, user);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(Authentication authentication, User user) {
        String accessToken = jwtUtils.generateToken(authentication);
        String refreshToken = createRefreshToken(user);
        return AuthResponse.of(accessToken, refreshToken, user);
    }

    private String createRefreshToken(User user) {
        // Clean old tokens for user
        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .build();

        return refreshTokenRepository.save(token).getToken();
    }
}
