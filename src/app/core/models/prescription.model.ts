import { Professional, PatientInfo } from './index';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
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
  appointment: {
    id: string;
    startsAt: string;
    endsAt: string;
  };
  patient: PatientInfo;
  professional: Professional;
  medications: Medication[];
  instructions: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreatePrescriptionDto {
  clinicId: string;
  appointmentId: string;
  patientId: string;
  professionalId: string;
  medications: Medication[];
  instructions: string;
  validUntil: string;
}

export interface UpdatePrescriptionDto {
  medications?: Medication[];
  instructions?: string;
  validUntil?: string;
}
