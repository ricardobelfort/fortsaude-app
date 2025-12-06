export interface Professional {
  id: string;
  clinicId: string;
  userId: string;
  firstName: string;
  lastName: string;
  category: string; // PHYSICIAN, PSYCHOLOGIST, etc.
  mainSpecialty: string;
  registrationCode: string; // CRM, CRP, etc.
  color?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfessionalDto {
  firstName: string;
  lastName: string;
  category: string;
  mainSpecialty: string;
  registrationCode: string;
  color?: string;
}

export interface UpdateProfessionalDto {
  firstName?: string;
  lastName?: string;
  category?: string;
  mainSpecialty?: string;
  registrationCode?: string;
  color?: string;
  active?: boolean;
}
