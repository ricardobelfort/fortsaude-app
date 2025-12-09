import { UserRole } from './role.model';

export interface User {
  id: string;
  clinicId: string;
  email: string;
  fullName: string;
  role: UserRole;
  iat: number;
  exp: number;
}
