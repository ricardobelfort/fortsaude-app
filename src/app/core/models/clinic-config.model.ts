/**
 * Configuração de agenda para uma clínica
 * Define horários, intervalos e outras preferências de agendamento
 */
export interface ClinicAgendaConfig {
  id?: string;
  clinicId: string;

  // Horários de funcionamento
  workStartTime: string; // ex: "08:00"
  workEndTime: string; // ex: "18:30"

  // Intervalo padrão de agendamento em minutos
  appointmentIntervalMinutes: number; // ex: 30, 40, 60

  // Horário de almoço (opcional)
  lunchStartTime?: string; // ex: "12:00"
  lunchEndTime?: string; // ex: "13:00"

  // Dias da semana ativo (segunda a domingo: 0-6, ou usar day names)
  activeDays: number[]; // [0, 1, 2, 3, 4] para seg-sex

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Configuração de agendamento para um profissional específico
 * Pode sobrescrever a configuração padrão da clínica
 */
export interface ProfessionalScheduleConfig extends ClinicAgendaConfig {
  professionalId: string;
}
