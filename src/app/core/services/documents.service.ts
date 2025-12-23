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
  private readonly basePath = '/documents';

  getByPatientId(patientId: string): Observable<Document[]> {
    return this.api.get<Document[]>(this.basePath, { params: { patientId } });
  }

  getById(id: string): Observable<Document> {
    return this.api.get<Document>(`${this.basePath}/${id}`);
  }

  upload(file: File, patientId: string, type: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('fileName', file.name);
    formData.append('patientId', patientId);

    return this.http.post<Document>(`${this.baseUrl}${this.basePath}`, formData);
  }

  /**
   * Assina um documento digitalmente
   * Usado para conformidade com órgãos reguladores
   * @param id ID do documento
   * @param signature Dados da assinatura digital
   */
  sign(
    id: string,
    signature: {
      signatureId: string;
      certificateId: string;
      algorithm: 'SHA256' | 'SHA512';
    }
  ): Observable<Document> {
    return this.api.post<Document>(`${this.basePath}/${id}/sign`, signature);
  }

  /**
   * Obtém a assinatura de um documento
   */
  getSignature(id: string): Observable<Record<string, unknown>> {
    return this.api.get<Record<string, unknown>>(`${this.basePath}/${id}/signature`);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  download(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.basePath}/${id}/download`, {
      responseType: 'blob',
    });
  }
}
