import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Observable } from 'rxjs';

export interface UserResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  clinic: {
    id: string;
    name: string;
  };
  person: {
    id: string;
    fullName: string;
    cpf: string;
    email: string;
    phone: string;
  };
  email: string;
  enabled: boolean;
  lastLogin: string;
}

export interface CreateUserRequest {
  clinicId: string;
  personId: string;
  addressId: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly api = inject(ApiClient);

  /**
   * Busca todos os usuários de uma clínica
   */
  getUsersByClinic(clinicId: string): Observable<UserResponse[]> {
    return this.api.get<UserResponse[]>(`/accounts`, {
      params: { clinicId },
    });
  }

  /**
   * Busca um usuário específico
   */
  getUser(userId: string): Observable<UserResponse> {
    return this.api.get<UserResponse>(`/accounts/${userId}`);
  }

  /**
   * Cria um novo usuário
   */
  createUser(data: CreateUserRequest): Observable<UserResponse> {
    return this.api.post<UserResponse>('/accounts', data);
  }

  /**
   * Atualiza um usuário existente
   */
  updateUser(userId: string, data: Partial<CreateUserRequest>): Observable<UserResponse> {
    return this.api.put<UserResponse>(`/accounts/${userId}`, data);
  }

  /**
   * Deleta um usuário
   */
  deleteUser(userId: string): Observable<void> {
    return this.api.delete<void>(`/accounts/${userId}`);
  }
}
