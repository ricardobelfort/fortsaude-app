import { UserRole } from './role.model';

export interface User {
  id: string;
  clinicId: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
