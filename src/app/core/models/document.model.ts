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
  // Suporte a versioning para auditoria regulatória
  version?: number;
  isSignedDigitally?: boolean;
  signatureId?: string;
  // Metadados para auditoria
  auditLog?: AuditLogEntry[];
}

/**
 * Entrada de log de auditoria para um documento
 * Suporta rastreamento completo para órgãos reguladores
 */
export interface AuditLogEntry {
  id: string;
  action: 'UPLOADED' | 'VIEWED' | 'DOWNLOADED' | 'SIGNED' | 'MODIFIED' | 'DELETED';
  userId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Documento assinado digitalmente
 * Usado para conformidade com órgãos como Marinha e Exército
 */
export interface SignedDocument extends Document {
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

export interface CreateDocumentDto {
  fileName: string;
  type: DocumentType;
  file: File;
}
