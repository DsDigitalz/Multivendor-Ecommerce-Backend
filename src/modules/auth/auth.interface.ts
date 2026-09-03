import { UserRole } from '../../config/constants';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
