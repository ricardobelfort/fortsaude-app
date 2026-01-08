import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiClient } from '@core/services/api.client';
import { Document } from '@core/models';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface DocumentUploadParams {
  clinicId: string;
  patientId: string;
  createdById: string;
  type: 'EXAM' | 'REPORT' | 'CONTRACT' | 'OTHER';
  name: string;
  description?: string;
  appointmentId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly basePath = '/documents';

  /**
   * Get all documents with optional filters
   * Query params: patientId, clinicId
   */
  getAll(patientId?: string, clinicId?: string): Observable<Document[]> {
    const params: Record<string, string> = {};
    if (patientId) params['patientId'] = patientId;
    if (clinicId) params['clinicId'] = clinicId;

    return this.api.get<Document[]>(this.basePath, { params });
  }

  /**
   * Get document by ID
   */
  getById(id: string): Observable<Document> {
    return this.api.get<Document>(`${this.basePath}/${id}`);
  }

  /**
   * Upload a new document
   * Endpoint: POST /api/documents
   * Body: multipart/form-data with file and parameters
   * Note: All parameters are sent in form-data, NOT as query params
   */
  upload(file: File, params: DocumentUploadParams): Observable<Document> {
    const formData = new FormData();

    // Add file
    formData.append('file', file);

    // Add parameters as form fields
    formData.append('clinicId', params.clinicId);
    formData.append('patientId', params.patientId);
    formData.append('createdById', params.createdById);
    formData.append('type', params.type);
    formData.append('name', params.name);

    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.appointmentId) {
      formData.append('appointmentId', params.appointmentId);
    }

    return this.http.post<Document>(`${this.baseUrl}${this.basePath}`, formData);
  }

  /**
   * Delete document by ID
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Download document by ID
   * Endpoint: GET /api/documents/{id}/download
   */
  download(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.basePath}/${id}/download`, {
      responseType: 'blob',
    });
  }
}
