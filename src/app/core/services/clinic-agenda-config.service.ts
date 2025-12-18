import { inject, Injectable, signal } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { ClinicAgendaConfig } from '@core/models';
import { Observable, map, catchError, of } from 'rxjs';

interface ClinicSettingResponse {
  id: string;
  clinicId: string;
  key: string;
  value: string;
  type: 'STRING' | 'INT' | 'BOOL' | 'JSON';
  description?: string;
}

/**
 * Serviço para gerenciar configurações de agenda das clínicas
 * Responsável por buscar e cachear as configurações de horários e intervalos
 */
@Injectable({
  providedIn: 'root',
})
export class ClinicAgendaConfigService {
  private readonly api = inject(ApiClient);

  // Cache de configurações em memória
  private configCache = signal<Map<string, ClinicAgendaConfig>>(new Map());

  /**
   * Busca a configuração de agenda de uma clínica
   * Tenta chamar a API primeiro; se falhar, usa configuração padrão
   */
  getClinicAgendaConfig(clinicId: string): Observable<ClinicAgendaConfig> {
    const cached = this.configCache().get(clinicId);
    if (cached) {
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.api
      .get<ClinicSettingResponse[]>(`/clinic-settings/clinic/${clinicId}`)
      .pipe(
        map((settings) => this.parseSettings(clinicId, settings)),
        catchError(() => {
          // Se a API falhar, retorna configuração padrão
          return of(this.getDefaultConfig(clinicId));
        })
      )
      .pipe(
        map((config) => {
          this.configCache().set(clinicId, config);
          return config;
        })
      );
  }

  /**
   * Salva configurações de agenda de uma clínica
   */
  saveClinicAgendaConfig(config: ClinicAgendaConfig): Observable<void> {
    const settings = this.configToSettings(config);
    const requests = settings.map((setting) =>
      this.api.post<ClinicSettingResponse>('/clinic-settings', setting)
    );

    return new Observable((observer) => {
      if (requests.length === 0) {
        observer.next();
        observer.complete();
        return;
      }

      let completed = 0;
      requests.forEach((request) => {
        request.subscribe({
          next: () => {
            completed++;
            if (completed === requests.length) {
              this.clearCache(config.clinicId);
              observer.next();
              observer.complete();
            }
          },
          error: (err) => observer.error(err),
        });
      });
    });
  }

  /**
   * Converte array de ClinicSettingResponse em ClinicAgendaConfig
   */
  private parseSettings(clinicId: string, settings: ClinicSettingResponse[]): ClinicAgendaConfig {
    const config = this.getDefaultConfig(clinicId);

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'workStartTime':
          config.workStartTime = setting.value;
          break;
        case 'workEndTime':
          config.workEndTime = setting.value;
          break;
        case 'appointmentIntervalMinutes':
          config.appointmentIntervalMinutes = parseInt(setting.value, 10);
          break;
        case 'lunchStartTime':
          config.lunchStartTime = setting.value;
          break;
        case 'lunchEndTime':
          config.lunchEndTime = setting.value;
          break;
        case 'activeDays':
          try {
            config.activeDays = JSON.parse(setting.value);
          } catch {
            config.activeDays = [0, 1, 2, 3, 4];
          }
          break;
      }
    });

    return config;
  }

  /**
   * Converte ClinicAgendaConfig em array de ClinicSettingRequest
   */
  private configToSettings(config: ClinicAgendaConfig): Array<{
    clinicId: string;
    key: string;
    value: string;
    type: string;
    description: string;
  }> {
    return [
      {
        clinicId: config.clinicId,
        key: 'workStartTime',
        value: config.workStartTime,
        type: 'STRING',
        description: 'Horário de início do funcionamento',
      },
      {
        clinicId: config.clinicId,
        key: 'workEndTime',
        value: config.workEndTime,
        type: 'STRING',
        description: 'Horário de término do funcionamento',
      },
      {
        clinicId: config.clinicId,
        key: 'appointmentIntervalMinutes',
        value: String(config.appointmentIntervalMinutes),
        type: 'INT',
        description: 'Intervalo padrão de agendamento em minutos',
      },
      {
        clinicId: config.clinicId,
        key: 'lunchStartTime',
        value: config.lunchStartTime || '',
        type: 'STRING',
        description: 'Horário de início do almoço',
      },
      {
        clinicId: config.clinicId,
        key: 'lunchEndTime',
        value: config.lunchEndTime || '',
        type: 'STRING',
        description: 'Horário de término do almoço',
      },
      {
        clinicId: config.clinicId,
        key: 'activeDays',
        value: JSON.stringify(config.activeDays),
        type: 'JSON',
        description: 'Dias da semana ativo (0-6)',
      },
    ];
  }

  /**
   * Retorna configuração padrão quando não há configuração específica
   */
  private getDefaultConfig(clinicId: string): ClinicAgendaConfig {
    return {
      clinicId,
      workStartTime: '08:00',
      workEndTime: '18:30',
      appointmentIntervalMinutes: 40,
      lunchStartTime: '12:00',
      lunchEndTime: '13:00',
      activeDays: [0, 1, 2, 3, 4],
    };
  }

  /**
   * Gera time slots baseado na configuração de agenda
   */
  generateTimeSlots(config: ClinicAgendaConfig): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = this.parseTime(config.workStartTime);
    const [endHour, endMinute] = this.parseTime(config.workEndTime);
    const interval = config.appointmentIntervalMinutes;

    let hour = startHour;
    let minute = startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    while (hour * 60 + minute < endTotalMinutes) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      // Verifica se está no horário de almoço
      if (config.lunchStartTime && config.lunchEndTime) {
        const slotTotalMinutes = hour * 60 + minute;
        const [lunchStartHour, lunchStartMinute] = this.parseTime(config.lunchStartTime);
        const [lunchEndHour, lunchEndMinute] = this.parseTime(config.lunchEndTime);
        const lunchStartTotalMinutes = lunchStartHour * 60 + lunchStartMinute;
        const lunchEndTotalMinutes = lunchEndHour * 60 + lunchEndMinute;

        if (slotTotalMinutes >= lunchStartTotalMinutes && slotTotalMinutes < lunchEndTotalMinutes) {
          hour = lunchEndHour;
          minute = lunchEndMinute;
          continue;
        }
      }

      slots.push({ time: timeStr, hour, minute, isLunch: false });

      // Incrementar tempo
      minute += interval;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }
    }

    return slots;
  }

  /**
   * Converte string de horário (HH:mm) para [hour, minute]
   */
  private parseTime(timeStr: string): [number, number] {
    const [hour, minute] = timeStr.split(':').map(Number);
    return [hour, minute];
  }

  /**
   * Limpa o cache (útil para atualizar configurações)
   */
  clearCache(clinicId?: string): void {
    if (clinicId) {
      this.configCache().delete(clinicId);
    } else {
      this.configCache.set(new Map());
    }
  }
}

/**
 * Interface para representar um slot de tempo
 */
export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  isLunch?: boolean;
}
