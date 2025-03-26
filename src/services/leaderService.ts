import { API_BASE_URL, defaultOptions } from '../config/api';
import { Leader } from '../types/leader';

export const leaderService = {
  async createLeader(data: Partial<Leader>): Promise<Leader> {
    try {
      // Ensure all required fields are present
      if (!data.name || !data.email || !data.dateOfBirth || !data.area || !data.phoneNumber || !data.address) {
        throw new Error('Missing required fields');
      }

      // Generate password from date of birth (DD-MM-YYYY format)
      const password = new Date(data.dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '');

      // First create the user account
      const userResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: password,
          role: 'leader',
          area: data.area
        })
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.message || 'Failed to create leader user account');
      }

      const userData = await userResponse.json();

      // Then create the leader profile
      const leaderResponse = await fetch(`${API_BASE_URL}/leaders`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({
          userId: userData.user.id,
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          anniversary: data.anniversary,
          maritalStatus: data.maritalStatus || 'Single',
          phoneNumber: data.phoneNumber,
          photo: data.photo,
          customFields: data.customFields || []
        })
      });

      if (!leaderResponse.ok) {
        // If leader profile creation fails, attempt to delete the user account
        await fetch(`${API_BASE_URL}/auth/users/${userData.user.id}`, {
          ...defaultOptions,
          method: 'DELETE'
        }).catch(err => console.error('Failed to cleanup user account:', err));

        const error = await leaderResponse.json();
        throw new Error(error.message || 'Failed to create leader profile');
      }

      const leaderData = await leaderResponse.json();
      return {
        ...leaderData,
        customFields: leaderData.customFields || []
      };
    } catch (error) {
      console.error('Leader creation failed:', error);
      throw error;
    }
  },

  async getLeaders(): Promise<Leader[]> {
    try {
      // First get all leaders
      const leadersResponse = await fetch(`${API_BASE_URL}/leaders`, defaultOptions);
      if (!leadersResponse.ok) {
        if (leadersResponse.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch leaders');
      }
      const leaders = await leadersResponse.json();

      // Then get all members to calculate counts
      const membersResponse = await fetch(`${API_BASE_URL}/members`, defaultOptions);
      if (!membersResponse.ok) {
        throw new Error('Failed to fetch members');
      }
      const members = await membersResponse.json();

      // Calculate active and total members for each leader
      return leaders.map(leader => {
        const leaderMembers = members.filter(member => member.leader === leader.userId);
        const activeMembers = leaderMembers.filter(member => 
          member.status === 'Active' || member.status === 'Moderate'
        ).length;
        const totalMembers = leaderMembers.length;

        return {
          ...leader,
          activeMembers,
          totalMembers,
          customFields: Array.isArray(leader.customFields) ? leader.customFields : []
        };
      });
    } catch (error) {
      console.error('Failed to fetch leaders:', error);
      return [];
    }
  },

  async updateLeader(id: string, data: Partial<Leader>): Promise<Leader> {
    const response = await fetch(`${API_BASE_URL}/leaders/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        customFields: Array.isArray(data.customFields) ? data.customFields : []
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update leader');
    }

    const updatedLeader = await response.json();
    return {
      ...updatedLeader,
      customFields: Array.isArray(updatedLeader.customFields) ? updatedLeader.customFields : []
    };
  },

  async deleteLeader(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/leaders/${id}`, {
      ...defaultOptions,
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete leader');
  }
};