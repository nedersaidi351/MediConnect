package com.mediconnect.controller;

import com.mediconnect.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chatbot")
@Slf4j
@Tag(name = "Chatbot", description = "Assistant médical d'orientation (intégration tierce)")
public class ChatbotController {

    @Value("${app.chatbot.api-key:}")
    private String chatbotApiKey;

    @PostMapping("/message")
    @Operation(summary = "Envoyer un message au chatbot médical")
    public ResponseEntity<ApiResponse<ChatbotResponse>> sendMessage(
            @RequestBody ChatbotMessageRequest request) {

        String userMessage = request.getMessage();
        if (userMessage == null || userMessage.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(ChatbotResponse.builder()
                    .message("Bonjour ! Comment puis-je vous aider aujourd'hui ?")
                    .build()));
        }

        ChatbotResponse response = buildResponse(userMessage.toLowerCase());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private ChatbotResponse buildResponse(String message) {

        // Greetings
        if (matches(message, "bonjour", "salut", "bonsoir", "allo", "hello", "aide", "help")) {
            return ChatbotResponse.builder()
                    .message("Bonjour ! Je suis l'assistant médical MediConnect. " +
                             "Décrivez vos symptômes et je vous orienterai vers le spécialiste approprié. " +
                             "Vous pouvez aussi taper 'secrétaire' pour parler à notre équipe.")
                    .build();
        }

        // Secretary handoff
        if (matches(message, "secrétaire", "secretaire", "humain", "personne", "opérateur", "operateur", "contact")) {
            return ChatbotResponse.builder()
                    .message("Je vais vous mettre en relation avec notre secrétaire médicale qui pourra vous aider personnellement. " +
                             "Vous pouvez également nous contacter directement depuis l'application.")
                    .handoff(true)
                    .build();
        }

        // Neurology
        if (matches(message, "tête", "tete", "migraine", "mal de tête", "vertige", "étourdissement",
                "mémoire", "memoire", "épilepsie", "epilepsie", "tremblements")) {
            return specialty("Neurologue",
                    "D'après vos symptômes, je vous recommande de consulter un Neurologue. " +
                    "Ces spécialistes traitent les affections du système nerveux, des maux de tête chroniques et des migraines.",
                    "neurologie");
        }

        // Cardiology
        if (matches(message, "cœur", "coeur", "poitrine", "douleur thoracique", "palpitation",
                "essoufflement", "tension", "hypertension", "infarctus", "insuffisance cardiaque")) {
            return specialty("Cardiologue",
                    "Vos symptômes évoquent un problème cardiaque. Je vous recommande vivement de consulter un Cardiologue. " +
                    "En cas de douleur thoracique intense, contactez les urgences immédiatement.",
                    "cardiologie");
        }

        // Dermatology
        if (matches(message, "peau", "bouton", "acné", "démangeaison", "rash", "allergie cutanée",
                "eczéma", "eczema", "psoriasis", "tache", "grain de beauté", "urticaire")) {
            return specialty("Dermatologue",
                    "Vos symptômes concernent la peau. Je vous recommande de consulter un Dermatologue, " +
                    "spécialiste des maladies de la peau, des ongles et des cheveux.",
                    "dermatologie");
        }

        // Pediatrics
        if (matches(message, "enfant", "bébé", "bebe", "nourrisson", "pédiatrie", "pediatrie",
                "fièvre enfant", "vaccin")) {
            return specialty("Pédiatre",
                    "Pour la santé de votre enfant, je vous recommande de consulter un Pédiatre, " +
                    "spécialiste de la médecine de l'enfant.",
                    "pédiatrie");
        }

        // Ophthalmology
        if (matches(message, "yeux", "vue", "vision", "lunettes", "myopie", "cataracte",
                "conjonctivite", "larmoiement", "œil", "oeil")) {
            return specialty("Ophtalmologue",
                    "Vos symptômes concernent la vision. Je vous recommande de consulter un Ophtalmologue, " +
                    "spécialiste de la santé des yeux.",
                    "ophtalmologie");
        }

        // Orthopedics / Rheumatology
        if (matches(message, "os", "articulation", "genou", "dos", "colonne", "lombalgie",
                "arthrite", "arthrose", "fracture", "entorse", "muscle", "tendon")) {
            return specialty("Rhumatologue / Orthopédiste",
                    "Vos symptômes concernent les os et les articulations. " +
                    "Je vous recommande de consulter un Rhumatologue ou un Orthopédiste selon la nature de votre problème.",
                    "rhumatologie");
        }

        // Gynecology
        if (matches(message, "règles", "regles", "menstruation", "grossesse", "gynécologie",
                "gynecologie", "contraception", "ménopause", "menopause", "kyste ovarien")) {
            return specialty("Gynécologue",
                    "Vos symptômes relèvent de la santé féminine. Je vous recommande de consulter un Gynécologue.",
                    "gynécologie");
        }

        // Psychiatry / Psychology
        if (matches(message, "stress", "anxiété", "anxiete", "dépression", "depression",
                "insomnie", "sommeil", "mental", "psychologique", "burnout", "fatigue chronique")) {
            return specialty("Psychiatre / Psychologue",
                    "Vos symptômes semblent liés à la santé mentale. " +
                    "Je vous recommande de consulter un Psychiatre ou un Psychologue. " +
                    "Prendre soin de sa santé mentale est tout aussi important que la santé physique.",
                    "psychiatrie");
        }

        // Gastroenterology
        if (matches(message, "ventre", "abdomen", "diarrhée", "diarrhee", "constipation",
                "nausée", "nausee", "vomissement", "reflux", "gastrite", "ulcère", "ulcere", "foie")) {
            return specialty("Gastro-entérologue",
                    "Vos symptômes concernent le système digestif. " +
                    "Je vous recommande de consulter un Gastro-entérologue.",
                    "gastro-entérologie");
        }

        // ENT (Ear, Nose, Throat)
        if (matches(message, "gorge", "nez", "oreille", "sinusite", "angine", "rhume",
                "toux", "voix", "oreilles", "surdité", "vertige otologique")) {
            return specialty("ORL (Oto-rhino-laryngologue)",
                    "Vos symptômes concernent la sphère ORL (oreilles, nez, gorge). " +
                    "Je vous recommande de consulter un ORL.",
                    "ORL");
        }

        // General / Fallback
        return ChatbotResponse.builder()
                .message("Je comprends votre préoccupation. Pour une évaluation précise de vos symptômes, " +
                         "je vous recommande de consulter un Médecin généraliste qui pourra vous orienter " +
                         "vers le spécialiste approprié si nécessaire. " +
                         "Décrivez vos symptômes plus en détail pour une meilleure orientation.")
                .specialty("Médecin généraliste")
                .specialtySearch("médecine générale")
                .suggestions(List.of(
                        "Douleurs articulaires",
                        "Problèmes cardiaques",
                        "Problèmes de peau",
                        "Santé mentale",
                        "Parler à la secrétaire"))
                .build();
    }

    private ChatbotResponse specialty(String name, String message, String searchKey) {
        return ChatbotResponse.builder()
                .message(message)
                .specialty(name)
                .specialtySearch(searchKey)
                .suggestions(List.of("Voir les médecins disponibles", "Prendre rendez-vous", "Parler à la secrétaire"))
                .build();
    }

    private boolean matches(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    // ─── DTOs ──────────────────────────────────────────────────────────────────

    @Data
    public static class ChatbotMessageRequest {
        private String message;
        private String sessionId;
    }

    @Data @Builder
    public static class ChatbotResponse {
        private String message;
        private String specialty;
        private String specialtySearch;
        private boolean handoff;
        private List<String> suggestions;
    }
}
