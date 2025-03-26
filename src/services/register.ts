import { API_BASE_URL, defaultOptions } from '../config/api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  area: string;
}

export const registerService = {
  async register(data: RegisterData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }
};