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

export interface CreatePatientDto {
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  documentId?: string;
  address?: string;
  notes?: string;
  active?: boolean;
}

export interface UpdatePatientDto {
  fullName?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  documentId?: string;
  address?: string;
  notes?: string;
  active?: boolean;
}
