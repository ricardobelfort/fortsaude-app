import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Evolution, CreateEvolutionDto, UpdateEvolutionDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvolutionsService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/evolutions';

  getByPatientId(
    patientId: string,
    params?: Record<string, string | string[]>
  ): Observable<Evolution[]> {
    return this.api.get<Evolution[]>(this.basePath, { params: { ...params, patientId } });
  }

  getById(id: string): Observable<Evolution> {
    return this.api.get<Evolution>(`${this.basePath}/${id}`);
  }

  create(dto: CreateEvolutionDto): Observable<Evolution> {
    return this.api.post<Evolution>(this.basePath, dto);
  }

  update(id: string, dto: UpdateEvolutionDto): Observable<Evolution> {
    return this.api.put<Evolution>(`${this.basePath}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
