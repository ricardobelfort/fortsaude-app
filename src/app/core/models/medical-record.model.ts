export interface MedicalRecord {
  id: string;
  clinicId: string;
  patientId: string;
  mainIssue: string;
  anamnesis: string;
  generalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // user ID
}

export interface CreateMedicalRecordDto {
  mainIssue: string;
  anamnesis: string;
  generalNotes?: string;
}

export interface UpdateMedicalRecordDto {
  mainIssue?: string;
  anamnesis?: string;
  generalNotes?: string;
}
