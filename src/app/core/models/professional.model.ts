import { Person, Account, Clinic } from './patient.model';

export interface ProfessionalProfile {
  id: string;
  account: Account;
  clinic: Clinic;
  role: string; // MEDICO, ENFERMEIRO, etc.
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  clinic: Clinic;
  profile: ProfessionalProfile;
  crm: string;
  specialty: string;
  availableFrom?: string;
  availableTo?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfessionalDto {
  profileId: string;
  clinicId: string;
  crm: string;
  specialty: string;
  availableFrom?: string;
  availableTo?: string;
}

export interface UpdateProfessionalDto {
  crm?: string;
  specialty?: string;
  availableFrom?: string;
  availableTo?: string;
}
