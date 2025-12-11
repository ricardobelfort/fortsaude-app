import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { MedicalRecord, CreateMedicalRecordDto, UpdateMedicalRecordDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService {
  private readonly api = inject(ApiClient);

  getByPatientId(patientId: string): Observable<MedicalRecord> {
    return this.api.get<MedicalRecord>(`/patients/${patientId}/medical-record`);
  }

  create(patientId: string, dto: CreateMedicalRecordDto): Observable<MedicalRecord> {
    return this.api.post<MedicalRecord>(`/patients/${patientId}/medical-record`, dto);
  }

  update(
    patientId: string,
    recordId: string,
    dto: UpdateMedicalRecordDto
  ): Observable<MedicalRecord> {
    return this.api.put<MedicalRecord>(`/patients/${patientId}/medical-record/${recordId}`, dto);
  }
}
