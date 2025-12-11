import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Patient, CreatePatientDto, UpdatePatientDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly api = inject(ApiClient);

  getAll(params?: Record<string, string | string[]>): Observable<Patient[]> {
    return this.api.get<Patient[]>('/patients', { params });
  }

  getById(id: string): Observable<Patient> {
    return this.api.get<Patient>(`/patients/${id}`);
  }

  create(dto: CreatePatientDto): Observable<Patient> {
    return this.api.post<Patient>('/patients', dto);
  }

  update(id: string, dto: UpdatePatientDto): Observable<Patient> {
    return this.api.put<Patient>(`/patients/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/patients/${id}`);
  }
}
