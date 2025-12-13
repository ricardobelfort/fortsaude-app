import { Professional, PatientInfo } from './index';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

export interface Appointment {
  id: string;
  clinic: {
    id: string;
    name: string;
    legalName: string;
    email: string;
    phone: string;
    cnpj: string;
    active: boolean;
    address?: unknown;
    createdAt: string;
    updatedAt: string;
  };
  patient: PatientInfo;
  professional: Professional;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AppointmentRecord {
  id: string;
  patientName: string;
  professionalName: string;
  startTime: string | Date;
  endTime: string | Date;
  status: string;
  notes?: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  professionalId: string;
  startsAt: string;
  endsAt: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentDto {
  patientId?: string;
  professionalId?: string;
  startsAt?: string;
  endsAt?: string;
  status?: AppointmentStatus;
  notes?: string;
}
