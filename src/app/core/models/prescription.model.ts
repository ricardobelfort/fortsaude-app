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
  // Suporte a revogação e assinatura digital
  status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
  isSignedDigitally?: boolean;
  signatureId?: string;
}

/**
 * Prescrição assinada digitalmente
 * Conformidade com órgãos reguladores (Marinha, Exército, etc)
 */
export interface SignedPrescription extends Prescription {
  signature: {
    signatureId: string;
    signedBy: string;
    signedAt: Date;
    certificateId: string;
    algorithm: 'SHA256' | 'SHA512';
    timestamp: string;
  };
  isValid: boolean;
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

/**
 * DTO para revogar uma prescrição
 * Mantém o histórico para auditoria
 */
export interface RevokePrescriptionDto {
  reason: string;
  revokedBy: string;
}
