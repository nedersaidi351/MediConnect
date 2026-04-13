package com.mediconnect.dto.request;

import com.mediconnect.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String password;

    @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Numéro de téléphone invalide")
    private String phone;

    @NotNull(message = "Le rôle est obligatoire")
    private User.Role role;
}
