import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface MedicalRecordDocument {
  id: string;
  recordId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  description?: string;
  createdAt: string;
  createdById: string;
}

export interface MedicalRecordDocumentUploadParams {
  recordId: string;
  profileId: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly basePath = '/medical-records';

  /**
   * Upload a document to a medical record
   * Endpoint: POST /api/medical-records/{recordId}/documents/upload
   * Body: multipart/form-data with file
   * Query params: profileId, description (optional)
   */
  uploadDocument(
    file: File,
    params: MedicalRecordDocumentUploadParams
  ): Observable<MedicalRecordDocument> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}${this.basePath}/${params.recordId}/documents/upload`;
    const queryParams = {
      profileId: params.profileId,
      ...(params.description && { description: params.description }),
    };

    return this.http.post<MedicalRecordDocument>(url, formData, { params: queryParams });
  }

  /**
   * Get all documents for a medical record
   * Endpoint: GET /api/medical-records/{recordId}/documents
   */
  getDocuments(recordId: string): Observable<MedicalRecordDocument[]> {
    const url = `${this.baseUrl}${this.basePath}/${recordId}/documents`;
    return this.http.get<MedicalRecordDocument[]>(url);
  }

  /**
   * Delete a document from a medical record
   * Endpoint: DELETE /api/medical-records/{recordId}/documents/{id}
   */
  deleteDocument(recordId: string, documentId: string): Observable<void> {
    const url = `${this.baseUrl}${this.basePath}/${recordId}/documents/${documentId}`;
    return this.http.delete<void>(url);
  }
}
