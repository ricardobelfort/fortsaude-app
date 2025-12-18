import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceType } from '../models';
import { ApiClient } from './api.client';

@Injectable({
  providedIn: 'root',
})
export class ServiceTypesService {
  private readonly api = inject(ApiClient);

  getByClinic(clinicId: string): Observable<ServiceType[]> {
    return this.api.get<ServiceType[]>('/services-provided', {
      params: { clinicId },
    });
  }

  getById(id: string): Observable<ServiceType> {
    return this.api.get<ServiceType>(`/services-provided/${id}`);
  }
}
