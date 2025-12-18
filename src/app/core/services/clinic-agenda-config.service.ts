import { inject, Injectable, signal } from '@angular/core';
import { ApiClient } from '@core/services/api.client';
import { ClinicAgendaConfig } from '@core/models';
import { Observable } from 'rxjs';

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
   * Por enquanto, retorna apenas a configuração padrão
   * TODO: Implementar chamada de API quando o backend estiver pronto
   */
  getClinicAgendaConfig(clinicId: string): Observable<ClinicAgendaConfig> {
    const cached = this.configCache().get(clinicId);
    if (cached) {
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }

    return new Observable((observer) => {
      // Usar configuração padrão por enquanto (sem chamada de API)
      const defaultConfig = this.getDefaultConfig(clinicId);
      this.configCache().set(clinicId, defaultConfig);
      observer.next(defaultConfig);
      observer.complete();
    });
  }

  /**
   * Retorna configuração padrão quando não há configuração específica
   */
  private getDefaultConfig(clinicId: string): ClinicAgendaConfig {
    return {
      clinicId,
      workStartTime: '08:00',
      workEndTime: '18:30',
      appointmentIntervalMinutes: 40, // Padrão: 40 minutos
      lunchStartTime: '12:00',
      lunchEndTime: '13:00',
      activeDays: [0, 1, 2, 3, 4], // Segunda a sexta
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
