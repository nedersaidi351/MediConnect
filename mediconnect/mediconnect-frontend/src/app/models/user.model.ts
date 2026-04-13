export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'DOCTOR' | 'SECRETARY' | 'ADMIN';
}
