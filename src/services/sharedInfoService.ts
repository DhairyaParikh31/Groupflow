import { API_BASE_URL, defaultOptions } from '../config/api';
import { SharedInfo } from '../pages/SharedInformation/types';

export const sharedInfoService = {
  async getSharedInfo(): Promise<SharedInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/shared-info`, defaultOptions);
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch shared information');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch shared information:', error);
      return [];
    }
  },

  async createSharedInfo(data: FormData): Promise<SharedInfo> {
    const response = await fetch(`${API_BASE_URL}/shared-info`, {
      method: 'POST',
      body: data,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create shared information');
    }
    
    return response.json();
  },

  async updateSharedInfo(id: string, data: FormData): Promise<SharedInfo> {
    const response = await fetch(`${API_BASE_URL}/shared-info/${id}`, {
      method: 'PUT',
      body: data,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update shared information');
    }
    
    return response.json();
  },

  async deleteSharedInfo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/shared-info/${id}`, {
      ...defaultOptions,
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete shared information');
    }
  }
};