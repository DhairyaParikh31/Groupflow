import { API_BASE_URL, defaultOptions } from '../config/api';
import { CustomField } from '../types/member';

export const customFieldService = {
  async getCustomFields(): Promise<CustomField[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/custom-fields`, defaultOptions);
      if (!response.ok) {
        throw new Error('Failed to fetch custom fields');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
      throw error;
    }
  },

  async createCustomField(data: { name: string; fieldType: string; defaultValue: string }): Promise<CustomField> {
    const response = await fetch(`${API_BASE_URL}/custom-fields`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create custom field');
    }
    
    return response.json();
  },

  async updateCustomField(id: string, data: { name: string; fieldType: string; defaultValue: string }): Promise<CustomField> {
    const response = await fetch(`${API_BASE_URL}/custom-fields/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update custom field');
    }
    
    return response.json();
  },

  async deleteCustomField(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/custom-fields/${id}`, {
      ...defaultOptions,
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete custom field');
    }
  }
};