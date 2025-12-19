export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN', // Administrador do sistema (acesso a tudo)
  CLINIC_ADMIN = 'CLINIC_ADMIN', // Administrador da clínica
  PATIENT = 'PATIENT', // Paciente
  PROFESSIONAL = 'PROFESSIONAL', // Médico/Profissional
  FINANCE = 'FINANCE', // Financeiro
  RECEPTIONIST = 'RECEPTIONIST', // Recepcionista
}

export type RoleType = keyof typeof UserRole;
