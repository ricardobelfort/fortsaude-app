export interface Evolution {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  professionalCategory?: string;
  dateTime: Date;
  notes: string;
  structuredData?: Record<string, unknown>; // JSON flexível
  createdAt: Date;
  updatedAt: Date;
  professional?: { firstName: string; lastName: string; category: string };
}

export interface CreateEvolutionDto {
  professionalId: string;
  dateTime: Date;
  notes: string;
  structuredData?: Record<string, unknown>;
}

export interface UpdateEvolutionDto {
  notes?: string;
  structuredData?: Record<string, unknown>;
}
