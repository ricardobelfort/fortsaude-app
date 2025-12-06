export interface Patient {
  id: string;
  clinicId: string;
  fullName: string;
  dateOfBirth: Date;
  document: string; // CPF/ID
  phone: string;
  email: string;
  address?: string;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientDto {
  fullName: string;
  dateOfBirth: Date;
  document: string;
  phone: string;
  email: string;
  address?: string;
  observations?: string;
}

export interface UpdatePatientDto {
  fullName?: string;
  dateOfBirth?: Date;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  observations?: string;
}
