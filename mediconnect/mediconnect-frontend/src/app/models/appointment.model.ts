export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  type: 'VIDEO' | 'AUDIO' | 'CHAT';
  reason: string;
  notes: string;
  createdAt: string;
}

export interface AppointmentRequest {
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: 'VIDEO' | 'AUDIO' | 'CHAT';
  reason?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
