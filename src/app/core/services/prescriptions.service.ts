import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionsService {
  private readonly api = inject(ApiClient);

  getAll(params?: Record<string, string | string[]>): Observable<Prescription[]> {
    return this.api.get<Prescription[]>('/prescriptions', { params });
  }

  getById(id: string): Observable<Prescription> {
    return this.api.get<Prescription>(`/prescriptions/${id}`);
  }

  getByPatient(patientId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>('/prescriptions', { params: { patientId } });
  }

  getByAppointment(appointmentId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>('/prescriptions', { params: { appointmentId } });
  }

  create(dto: CreatePrescriptionDto): Observable<Prescription> {
    return this.api.post<Prescription>('/prescriptions', dto);
  }

  update(id: string, dto: UpdatePrescriptionDto): Observable<Prescription> {
    return this.api.put<Prescription>(`/prescriptions/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/prescriptions/${id}`);
  }
}
