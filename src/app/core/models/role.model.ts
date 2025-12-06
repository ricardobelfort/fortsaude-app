export enum UserRole {
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  RECEPTIONIST = 'RECEPTIONIST',
  FINANCE = 'FINANCE',
  ASSISTANT = 'ASSISTANT',
}

export type RoleType = keyof typeof UserRole;
