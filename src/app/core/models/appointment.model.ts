export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: { fullName: string };
  professional?: {
    id: string;
    profile: {
      account: {
        person: {
          fullName: string;
        };
      };
    };
  };
}

export interface CreateAppointmentDto {
  patientId: string;
  professionalId: string;
  startTime: Date;
  endTime: Date;
  status?: AppointmentStatus;
  observations?: string;
}

export interface UpdateAppointmentDto {
  patientId?: string;
  professionalId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: AppointmentStatus;
  observations?: string;
}
