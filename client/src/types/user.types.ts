export interface User {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email?: string;
  role?: 'user' | 'organisateur' | 'admin';
  createdAt?: Date;
}

export interface UserProfile {
  id: number;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  prenom: string;
  nom: string;
}

export interface ChangePasswordData {
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TokenVerifyResponse {
  user: User;
}
