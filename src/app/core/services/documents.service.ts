import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiClient } from '@core/services/api.client';
import { Document } from '@core/models';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  getByPatientId(patientId: string): Observable<Document[]> {
    return this.api.get<Document[]>(`/patients/${patientId}/documents`);
  }

  getById(patientId: string, documentId: string): Observable<Document> {
    return this.api.get<Document>(`/patients/${patientId}/documents/${documentId}`);
  }

  upload(patientId: string, file: File, type: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('fileName', file.name);

    return this.http.post<Document>(`${this.baseUrl}/patients/${patientId}/documents`, formData);
  }

  delete(patientId: string, documentId: string): Observable<void> {
    return this.api.delete<void>(`/patients/${patientId}/documents/${documentId}`);
  }

  download(patientId: string, documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/patients/${patientId}/documents/${documentId}/download`, {
      responseType: 'blob',
    });
  }
}
