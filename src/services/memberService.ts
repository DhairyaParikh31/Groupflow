import { API_BASE_URL, defaultOptions } from '../config/api';
import { Member } from '../types/member';

export const memberService = {
  async getMembers(): Promise<Member[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/members`, defaultOptions);
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch members');
      }
      const members = await response.json();
      return members.map((member: any) => ({
        ...member,
        area: member.leaderArea || member.area || 'Not assigned' // Ensure area is always defined
      }));
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return [];
    }
  },

  async createMember(data: Partial<Member>): Promise<Member> {
    // Validate required fields before sending to server
    if (!data.name || !data.dateOfBirth || !data.leader || !data.phoneNumber || 
        !data.address || !data.status || !data.maritalStatus) {
      throw new Error('Missing required fields');
    }

    const response = await fetch(`${API_BASE_URL}/members`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        ...data,
        // Ensure leader is properly passed as a string
        leader: data.leader.toString()
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create member');
    }
    
    const member = await response.json();
    return {
      ...member,
      area: member.leaderArea || member.area || 'Not assigned' // Ensure area is always defined
    };
  },

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        // Ensure leader is properly passed as a string
        leader: data.leader?.toString()
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update member');
    }
    
    const member = await response.json();
    return {
      ...member,
      area: member.leaderArea || member.area || 'Not assigned' // Ensure area is always defined
    };
  },

  async deleteMember(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      ...defaultOptions,
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete member');
    }
  }
};