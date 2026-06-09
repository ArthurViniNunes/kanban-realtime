import { api } from './api';
import type { LoginResponse } from '@/types/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);

    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', data);

    return response.data;
  },

  async me() {
    const response = await api.get('/auth/me');

    return response.data;
  },

  async deleteMe() {
    const response = await api.delete('/auth/me');

    return response.data;
  },
};
