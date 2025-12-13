import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api.client';

export interface ProfileResponse {
  id: string;
  account: {
    id: string;
    email: string;
    person: {
      id: string;
      fullName: string;
      cpf: string;
      email: string;
      phone: string;
      birthDate: string;
      gender: string;
      active: boolean;
      createdAt: string;
      updatedAt: string;
    };
    clinic: {
      id: string;
      name: string;
      legalName: string;
      cnpj: string;
      email: string;
      phone: string;
      active: boolean;
      createdAt: string;
      updatedAt: string;
    };
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  };
  clinic: {
    id: string;
    name: string;
    legalName: string;
    cnpj: string;
    email: string;
    phone: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  private readonly apiClient = inject(ApiClient);

  getAll(params?: Record<string, string | string[]>): Observable<ProfileResponse[]> {
    return this.apiClient.get<ProfileResponse[]>('/profiles', params);
  }

  getById(id: string): Observable<ProfileResponse> {
    return this.apiClient.get<ProfileResponse>(`/profiles/${id}`);
  }
}
