import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import {
  Prescription,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  RevokePrescriptionDto,
} from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionsService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/prescriptions';

  getAll(params?: Record<string, string | string[]>): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(this.basePath, { params });
  }

  getById(id: string): Observable<Prescription> {
    return this.api.get<Prescription>(`${this.basePath}/${id}`);
  }

  getByPatient(patientId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(this.basePath, { params: { patientId } });
  }

  getByProfessional(professionalId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(this.basePath, { params: { professionalId } });
  }

  getByClinic(clinicId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(this.basePath, { params: { clinicId } });
  }

  create(dto: CreatePrescriptionDto): Observable<Prescription> {
    return this.api.post<Prescription>(this.basePath, dto);
  }

  update(id: string, dto: UpdatePrescriptionDto): Observable<Prescription> {
    return this.api.put<Prescription>(`${this.basePath}/${id}`, dto);
  }

  /**
   * Revoga uma prescrição com motivo registrado para auditoria
   * @param id ID da prescrição
   * @param dto Dados da revogação
   */
  revoke(id: string, dto: RevokePrescriptionDto): Observable<Prescription> {
    return this.api.post<Prescription>(`${this.basePath}/${id}/revoke`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
