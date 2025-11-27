import { api } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
  roleId: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  token: string;
  refreshToken: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('Logging in with credentials:', credentials);
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Registro
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Obtener perfil
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
};