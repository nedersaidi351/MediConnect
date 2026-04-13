-- ============================================================
-- MediConnect - Repair migration for partially initialized DB
-- Migration: V2__repair_missing_tables.sql
-- Purpose: Create any missing tables/indexes if V1 was skipped
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(30)  NOT NULL CHECK (role IN ('PATIENT','DOCTOR','SECRETARY','ADMIN')),
    enabled     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specialties (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty_id        BIGINT       NOT NULL REFERENCES specialties(id),
    license_number      VARCHAR(100) NOT NULL UNIQUE,
    bio                 TEXT,
    years_experience    INT          NOT NULL DEFAULT 0,
    consultation_fee    DECIMAL(10,2),
    avatar_url          VARCHAR(255),
    address             VARCHAR(255),
    city                VARCHAR(100),
    is_verified         BOOLEAN      NOT NULL DEFAULT FALSE,
    average_rating      DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    total_reviews       INT          NOT NULL DEFAULT 0,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_profiles (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth    DATE,
    gender           VARCHAR(10) CHECK (gender IN ('MALE','FEMALE','OTHER')),
    blood_type       VARCHAR(5),
    allergies        TEXT,
    chronic_diseases TEXT,
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    avatar_url       VARCHAR(255),
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS availability_slots (
    id          BIGSERIAL PRIMARY KEY,
    doctor_id   BIGINT      NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    UNIQUE (doctor_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS appointments (
    id                 BIGSERIAL PRIMARY KEY,
    patient_id         BIGINT      NOT NULL REFERENCES patient_profiles(id),
    doctor_id          BIGINT      NOT NULL REFERENCES doctor_profiles(id),
    appointment_date   DATE        NOT NULL,
    start_time         TIME        NOT NULL,
    end_time           TIME        NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW')),
    type               VARCHAR(20) NOT NULL DEFAULT 'VIDEO'
                       CHECK (type IN ('VIDEO','AUDIO','CHAT')),
    reason             TEXT,
    notes              TEXT,
    cancellation_reason TEXT,
    created_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
    id               BIGSERIAL PRIMARY KEY,
    appointment_id   BIGINT UNIQUE NOT NULL REFERENCES appointments(id),
    diagnosis        TEXT,
    prescription     TEXT,
    notes            TEXT,
    follow_up_date   DATE,
    duration_minutes INT,
    started_at       TIMESTAMP,
    ended_at         TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT      NOT NULL REFERENCES appointments(id),
    sender_id       BIGINT      NOT NULL REFERENCES users(id),
    content         TEXT        NOT NULL,
    message_type    VARCHAR(20) NOT NULL DEFAULT 'TEXT'
                    CHECK (message_type IN ('TEXT','IMAGE','FILE','SYSTEM')),
    file_url        VARCHAR(255),
    is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id              BIGSERIAL PRIMARY KEY,
    doctor_id       BIGINT      NOT NULL REFERENCES doctor_profiles(id),
    patient_id      BIGINT      NOT NULL REFERENCES patient_profiles(id),
    appointment_id  BIGINT      UNIQUE REFERENCES appointments(id),
    rating          INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    is_anonymous    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (doctor_id, patient_id, appointment_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    type        VARCHAR(50)  NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    data        JSONB,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_appt ON chat_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_spec ON doctor_profiles(specialty_id);

INSERT INTO specialties (name, icon) VALUES
    ('Médecine générale', 'stethoscope'),
    ('Cardiologie', 'heart'),
    ('Dermatologie', 'skin'),
    ('Pédiatrie', 'baby'),
    ('Gynécologie', 'female'),
    ('Neurologie', 'brain'),
    ('Orthopédie', 'bone'),
    ('Ophtalmologie', 'eye'),
    ('Psychiatrie', 'mind'),
    ('Endocrinologie', 'hormone'),
    ('Gastro-entérologie', 'stomach'),
    ('Pneumologie', 'lungs'),
    ('Urologie', 'kidney'),
    ('Rhumatologie', 'joint'),
    ('ORL', 'ear')
ON CONFLICT (name) DO NOTHING;
