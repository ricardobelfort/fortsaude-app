import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Professional, CreateProfessionalDto, UpdateProfessionalDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalsService {
  private readonly api = inject(ApiClient);

  getAll(params?: Record<string, string | string[]>): Observable<Professional[]> {
    return this.api.get<Professional[]>('/professionals', { params });
  }

  getById(id: string): Observable<Professional> {
    return this.api.get<Professional>(`/professionals/${id}`);
  }

  create(dto: CreateProfessionalDto): Observable<Professional> {
    return this.api.post<Professional>('/professionals', dto);
  }

  update(id: string, dto: UpdateProfessionalDto): Observable<Professional> {
    return this.api.put<Professional>(`/professionals/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/professionals/${id}`);
  }
}
