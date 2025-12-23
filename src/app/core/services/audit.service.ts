import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Observable } from 'rxjs';

/**
 * Tipos de eventos auditáveis no sistema
 * Integrado para conformidade com órgãos como Marinha e Exército
 */
export enum AuditEventType {
  // Prontuário
  MEDICAL_RECORD_CREATED = 'MEDICAL_RECORD_CREATED',
  MEDICAL_RECORD_VIEWED = 'MEDICAL_RECORD_VIEWED',
  MEDICAL_RECORD_MODIFIED = 'MEDICAL_RECORD_MODIFIED',
  MEDICAL_RECORD_EXPORTED = 'MEDICAL_RECORD_EXPORTED',

  // Evoluções
  EVOLUTION_CREATED = 'EVOLUTION_CREATED',
  EVOLUTION_VIEWED = 'EVOLUTION_VIEWED',
  EVOLUTION_MODIFIED = 'EVOLUTION_MODIFIED',
  EVOLUTION_DELETED = 'EVOLUTION_DELETED',

  // Prescrições
  PRESCRIPTION_CREATED = 'PRESCRIPTION_CREATED',
  PRESCRIPTION_VIEWED = 'PRESCRIPTION_VIEWED',
  PRESCRIPTION_MODIFIED = 'PRESCRIPTION_MODIFIED',
  PRESCRIPTION_REVOKED = 'PRESCRIPTION_REVOKED',

  // Documentos
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
  DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',

  // Pacientes
  PATIENT_RECORD_ACCESSED = 'PATIENT_RECORD_ACCESSED',
  PATIENT_DATA_EXPORTED = 'PATIENT_DATA_EXPORTED',

  // Autenticação e autorização
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  ACCESS_DENIED = 'ACCESS_DENIED',
}

/**
 * Estrutura de um evento de auditoria
 */
export interface AuditEvent {
  id?: string;
  eventType: AuditEventType;
  userId: string;
  clinicId: string;
  patientId?: string;
  resourceId?: string;
  resourceType: 'PATIENT' | 'MEDICAL_RECORD' | 'EVOLUTION' | 'PRESCRIPTION' | 'DOCUMENT';
  timestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, unknown>; // Mudanças específicas (para MODIFIED events)
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Resposta de auditoria do servidor
 * Estrutura real baseada na documentação e response da API
 */
export interface AuditEventResponse {
  id: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  entityType: string; // Patient, MedicalRecord, Evolution, Prescription, Document
  entityId: string;
  details: Record<string, unknown>; // {field, value, ...}
  user: {
    id: string;
    role: string;
    account: {
      person: {
        fullName: string;
      };
    };
  };
  clinic: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Serviço de Auditoria
 * Responsável por rastrear logs de auditoria para conformidade com órgãos
 * de regulação como Marinha e Exército.
 *
 * Recursos:
 * - Leitura de logs de auditoria por ID
 * - Recuperação de todos os logs da clínica
 */
@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/audit-logs';

  /**
   * Obtém todos os logs de auditoria da clínica atual
   * Endpoint: GET /audit-logs
   */
  getAllLogs(): Observable<AuditEventResponse[]> {
    return this.api.get<AuditEventResponse[]>(this.basePath);
  }

  /**
   * Obtém um log de auditoria específico por ID
   * Endpoint: GET /audit-logs/{id}
   * @param id ID do log de auditoria
   */
  getLogById(id: string): Observable<AuditEventResponse> {
    return this.api.get<AuditEventResponse>(`${this.basePath}/${id}`);
  }
}
