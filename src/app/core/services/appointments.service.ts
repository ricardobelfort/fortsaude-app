import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private readonly api = inject(ApiClient);

  getAll(params?: Record<string, string | string[]>): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/appointments', { params });
  }

  getById(id: string): Observable<Appointment> {
    return this.api.get<Appointment>(`/appointments/${id}`);
  }

  create(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.api.post<Appointment>('/appointments', dto);
  }

  update(id: string, dto: UpdateAppointmentDto): Observable<Appointment> {
    return this.api.put<Appointment>(`/appointments/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/appointments/${id}`);
  }

  /**
   * Check-in para uma consulta
   * @param appointmentId ID da consulta
   * @param userId ID do usuário realizando o check-in
   */
  checkIn(appointmentId: string, userId: string): Observable<Appointment> {
    return this.api.post<Appointment>(`/appointments/${appointmentId}/checkin`, null, {
      params: { userId },
    });
  }

  /**
   * Check-out para uma consulta
   * @param appointmentId ID da consulta
   * @param userId ID do usuário realizando o check-out
   */
  checkOut(appointmentId: string, userId: string): Observable<Appointment> {
    return this.api.post<Appointment>(`/appointments/${appointmentId}/checkout`, null, {
      params: { userId },
    });
  }
}
