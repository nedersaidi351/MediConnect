export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'PATIENT' | 'DOCTOR' | 'SECRETARY';
}

export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: number;
    email: string;
    fullName: string;
    role: 'PATIENT' | 'DOCTOR' | 'SECRETARY' | 'ADMIN';
  };
  success: boolean;
  message: string;
}
