import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { MedicalRecord, CreateMedicalRecordDto, UpdateMedicalRecordDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/medical-records';

  getByPatientId(patientId: string): Observable<MedicalRecord> {
    return this.api.get<MedicalRecord>(`${this.basePath}/patient/${patientId}`);
  }

  getById(id: string): Observable<MedicalRecord> {
    return this.api.get<MedicalRecord>(`${this.basePath}/${id}`);
  }

  create(dto: CreateMedicalRecordDto): Observable<MedicalRecord> {
    return this.api.post<MedicalRecord>(this.basePath, dto);
  }

  update(id: string, dto: UpdateMedicalRecordDto): Observable<MedicalRecord> {
    return this.api.put<MedicalRecord>(`${this.basePath}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
