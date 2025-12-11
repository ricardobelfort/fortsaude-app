import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Evolution, CreateEvolutionDto, UpdateEvolutionDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvolutionsService {
  private readonly api = inject(ApiClient);

  getByPatientId(
    patientId: string,
    params?: Record<string, string | string[]>
  ): Observable<Evolution[]> {
    return this.api.get<Evolution[]>(`/patients/${patientId}/evolutions`, { params });
  }

  getById(patientId: string, evolutionId: string): Observable<Evolution> {
    return this.api.get<Evolution>(`/patients/${patientId}/evolutions/${evolutionId}`);
  }

  create(patientId: string, dto: CreateEvolutionDto): Observable<Evolution> {
    return this.api.post<Evolution>(`/patients/${patientId}/evolutions`, dto);
  }

  update(patientId: string, evolutionId: string, dto: UpdateEvolutionDto): Observable<Evolution> {
    return this.api.put<Evolution>(`/patients/${patientId}/evolutions/${evolutionId}`, dto);
  }

  delete(patientId: string, evolutionId: string): Observable<void> {
    return this.api.delete<void>(`/patients/${patientId}/evolutions/${evolutionId}`);
  }
}
