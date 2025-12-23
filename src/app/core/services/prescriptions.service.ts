import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionsService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/v1/prescriptions';

  getAll(params?: Record<string, string | string[]>): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(this.basePath, { params });
  }

  getById(id: string): Observable<Prescription> {
    return this.api.get<Prescription>(`${this.basePath}/${id}`);
  }

  getByPatient(patientId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(`${this.basePath}/patient/${patientId}`);
  }

  getByProfessional(professionalId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(`${this.basePath}/professional/${professionalId}`);
  }

  getByClinic(clinicId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(`${this.basePath}/clinic/${clinicId}`);
  }

  create(dto: CreatePrescriptionDto): Observable<Prescription> {
    return this.api.post<Prescription>(this.basePath, dto);
  }

  update(id: string, dto: UpdatePrescriptionDto): Observable<Prescription> {
    return this.api.put<Prescription>(`${this.basePath}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
