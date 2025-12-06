export enum DocumentType {
  EXAM = 'EXAM',
  REPORT = 'REPORT',
  CONTRACT = 'CONTRACT',
  OTHER = 'OTHER',
}

export interface Document {
  id: string;
  clinicId: string;
  patientId: string;
  fileName: string;
  type: DocumentType;
  uploadedBy: string; // professional ID
  uploadedAt: Date;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentDto {
  fileName: string;
  type: DocumentType;
  file: File;
}
