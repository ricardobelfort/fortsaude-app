export interface Clinic {
  active: boolean;
  address: string | null;
  cnpj: string;
  createdAt: string;
  email: string;
  id: string;
  legalName: string;
  name: string;
  phone: string;
  updatedAt: string;
}

export interface Person {
  active: boolean;
  address: string | null;
  birthDate: string;
  cpf: string;
  createdAt: string;
  email: string;
  fullName: string;
  gender: string;
  id: string;
  phone: string;
  rg: string | null;
  updatedAt: string;
}

export interface Account {
  address: string | null;
  clinic: Clinic;
  createdAt: string;
  email: string;
  enabled: boolean;
  id: string;
  lastLogin: string | null;
  person: Person;
  updatedAt: string;
}

export interface Patient {
  id: string;
  active: boolean;
  address: string | null;
  clinic: Clinic;
  createdAt: string;
  createdBy: Record<string, unknown>;
  dateOfBirth: string;
  documentId: string | null;
  email: string;
  fullName: string;
  notes: string | null;
  phone: string;
  updatedAt: string;
}

export interface PatientInfo {
  id: string;
  active: boolean;
  fullName: string;
  documentId: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  notes?: string;
  rg?: string;
  gender?: string;
  bloodType?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  emergencyContactDegree?: string;
  medicalDoctor?: string;
  healthTreatment?: boolean;
  healthTreatmentDetails?: string;
  medications?: boolean;
  medicationsDetails?: string;
  healthPlan?: boolean;
  healthPlanDetails?: string;
  dentalTreatment?: boolean;
  dentalTreatmentDetails?: string;
  specialCareNeeded?: boolean;
  specialCareDetails?: string;
  specialties?: string;
  preferredSchedule?: string;
  agreement?: string;
  address?: Address;
  clinic?: Clinic;
  createdAt: string | Date;
  createdBy: string | Date;
}

export interface CreatePatientDto {
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  documentId?: string;
  rg?: string;
  gender?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  emergencyContactDegree?: string;
  bloodType?: string;
  medicalDoctor?: string;
  healthTreatment?: boolean;
  healthTreatmentDetails?: string;
  medications?: boolean;
  medicationsDetails?: string;
  healthPlan?: boolean;
  healthPlanDetails?: string;
  dentalTreatment?: boolean;
  dentalTreatmentDetails?: string;
  specialCareNeeded?: boolean;
  specialCareDetails?: string;
  specialties?: string;
  preferredSchedule?: string;
  agreement?: string;
  // Address fields
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressZipCode?: string;
  addressCity?: string;
  addressState?: string;
  addressType?: string;
  notes?: string;
  active?: boolean;
}

export interface UpdatePatientDto {
  fullName?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  documentId?: string;
  rg?: string;
  gender?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  emergencyContactDegree?: string;
  bloodType?: string;
  medicalDoctor?: string;
  healthTreatment?: boolean;
  healthTreatmentDetails?: string;
  medications?: boolean;
  medicationsDetails?: string;
  healthPlan?: boolean;
  healthPlanDetails?: string;
  dentalTreatment?: boolean;
  dentalTreatmentDetails?: string;
  specialCareNeeded?: boolean;
  specialCareDetails?: string;
  specialties?: string;
  preferredSchedule?: string;
  agreement?: string;
  // Address fields
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressZipCode?: string;
  addressCity?: string;
  addressState?: string;
  addressType?: string;
  notes?: string;
  active?: boolean;
}

export interface Address {
  city: string;
  complement: string;
  createdAt: string;
  id: string;
  neighborhood: string;
  number: string;
  state: string;
  street: string;
  type: string;
  updatedAt: string;
  zipCode: string;
}
