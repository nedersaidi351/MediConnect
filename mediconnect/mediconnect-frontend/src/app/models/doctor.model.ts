export interface DoctorProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  specialtyId: number;
  licenseNumber: string;
  bio: string;
  yearsExperience: number;
  consultationFee: number;
  avatarUrl: string;
  address: string;
  city: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  availabilitySlots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Specialty {
  id: number;
  name: string;
  icon: string;
}
